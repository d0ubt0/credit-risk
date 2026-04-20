import json

import numpy as np
import pandas as pd

important_features = [
    # Historial crediticio
    "delinq_2yrs",
    "mths_since_last_delinq",
    "mths_since_last_major_derog",
    "pub_rec",

    # Capacidad de pago
    "annual_inc",
    "annual_inc_joint",
    "dti",
    "dti_joint",
    "installment",
    "loan_amnt",

    # Uso de crédito
    "revol_util",
    "revol_bal",
    "total_rev_hi_lim",
    "all_util",

    # Estructura crediticia
    "open_acc",
    "total_acc",

    # Perfil del cliente
    "home_ownership",
    "emp_length",
    "purpose",

    # Variables útiles del sistema (usar con cuidado)
    "grade",
    "sub_grade",
    "term",
    "int_rate"
]

important_features = [
    "last_pymnt_amnt",
    "recoveries",
    "out_prncp",
    "int_rate",
    "term",
    "total_rec_late_fee",
    "tot_cur_bal",
    "dti",
    "initial_list_status",
    "loan_amnt",
    "grade"
]

def remove_outliers_iqr(df, columns, iqr_multiplier=1.5):
    df_clean = df.copy()
    initial_rows = len(df_clean)

    for col in columns:
        if col not in df_clean.columns:
            continue
        if not pd.api.types.is_numeric_dtype(df_clean[col]):
            continue

        series = df_clean[col].dropna()
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1

        # ✅ Si IQR = 0, la columna es casi constante — no filtrar
        if IQR == 0:
            print(f"⚠️  '{col}': IQR=0, columna casi constante — se omite el filtro.")
            continue

        lower_bound = Q1 - iqr_multiplier * IQR
        upper_bound = Q3 + iqr_multiplier * IQR

        before = len(df_clean)
        df_clean = df_clean[
            (df_clean[col].isna()) |
            ((df_clean[col] >= lower_bound) & (df_clean[col] <= upper_bound))
        ]
        removed = before - len(df_clean)
        if removed > 0:
            print(f"🗑️  '{col}': {removed} filas eliminadas | límites [{lower_bound:.2f}, {upper_bound:.2f}]")

    total_removed = initial_rows - len(df_clean)
    print(f"\n📊 Total eliminado: {total_removed} filas ({total_removed/initial_rows*100:.2f}%)")
    print(f"✅ Filas restantes: {len(df_clean)}")
    return df_clean


def build_population_distribution(
    df: pd.DataFrame,
    columns: list,
    bin_size_map: dict = None,
    fixed_ranges: dict = None,
    output_path: str = None,
    n: int = None,
    max_buckets: int = 50,
) -> dict:
    """
    Genera distribuciones poblacionales para atributos numéricos y categóricos.

    Parámetros:
    - df            : DataFrame con los datos
    - columns       : columnas a procesar
    - bin_size_map  : tamaño de bin por columna numérica  {"score": 25, "edad": 5}
    - fixed_ranges  : rangos fijos por columna numérica   {"score": (300, 850)}
    - output_path   : ruta opcional para exportar JSON
    - n             : número de filas a usar (opcional)
    - max_buckets   : máximo número de buckets para columnas numéricas (default 50)

    Retorna dict con distribuciones por atributo.
    """
    if not isinstance(df, pd.DataFrame) or df.empty:
        raise ValueError("df debe ser un DataFrame no vacío.")

    if n is not None:
        if not isinstance(n, int) or n <= 0:
            raise ValueError("n debe ser un entero positivo.")
        df = df.head(n)

    bin_size_map = bin_size_map or {}
    fixed_ranges = fixed_ranges or {}
    all_distributions = {}

    for col in columns:
        if col not in df.columns:
            print(f"⚠️  Columna '{col}' no existe, se omite.")
            continue

        series = df[col].dropna()

        if series.empty:
            print(f"⚠️  Columna '{col}' vacía tras eliminar nulos.")
            all_distributions[col] = {"type": "unknown", "distribution": []}
            continue

        # ── Rama categórica ───────────────────────────────────────────
        if not pd.api.types.is_numeric_dtype(series):
            counts = series.value_counts().sort_index()
            total = len(series)

            distribution = [
                {
                    "value": str(cat),
                    "label": str(cat),
                    "count": int(cnt),
                    "porcentaje": round(cnt / total * 100, 2),
                }
                for cat, cnt in counts.items()
            ]

            all_distributions[col] = {"type": "categorical", "distribution": distribution}
            print(f"✅ '{col}' (categórica): {len(distribution)} categorías — {total} registros.")
            continue

        # ── Rama numérica ─────────────────────────────────────────────
        if col in fixed_ranges:
            min_val, max_val = fixed_ranges[col]
        else:
            min_val = np.floor(series.min())
            max_val = np.ceil(series.max())

        series = series[(series >= min_val) & (series <= max_val)]

        if series.empty:
            print(f"⚠️  Columna '{col}': ningún valor dentro del rango {(min_val, max_val)}.")
            all_distributions[col] = {"type": "numeric", "distribution": []}
            continue

        rango = max_val - min_val
        bin_size_base = bin_size_map.get(col, 25)
        bin_size_min_requerido = rango / max_buckets

        bin_size = max(bin_size_base, bin_size_min_requerido)

        if bin_size >= 1:
            magnitude = 10 ** np.floor(np.log10(bin_size))
            bin_size = np.ceil(bin_size / magnitude) * magnitude

        edges = np.arange(min_val, max_val + bin_size, bin_size)
        labels_left = edges[:-1]

        cuts = pd.cut(series, bins=edges, labels=labels_left, right=False, include_lowest=True)
        counts = cuts.value_counts().sort_index()
        total = len(series)

        distribution = [
            {
                "value": round(float(b), 4),
                "label": f"{round(float(b), 2)}–{round(float(b + bin_size), 2)}",
                "count": int(counts.get(b, 0)),
                "porcentaje": round(counts.get(b, 0) / total * 100, 2),
            }
            for b in labels_left
        ]

        all_distributions[col] = {"type": "numeric", "distribution": distribution}
        print(f"✅ '{col}' (numérica): {len(distribution)} buckets — {total} registros.")

    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(all_distributions, f, indent=2, ensure_ascii=False)
        print(f"💾 JSON guardado en '{output_path}'.")

    return all_distributions


np.random.seed(42)
df = pd.read_csv("loan.csv")

# ── Eliminar outliers extremos antes de construir distribuciones ──
df = remove_outliers_iqr(df, columns=important_features, iqr_multiplier=3)

distributions = build_population_distribution(
    df,
    columns=important_features,
    bin_size_map={
        "int_rate":           0.5,   # rango ~5-30%
        "dti":                1.0,   # rango ~0-60
        "recoveries":         10,
        "total_rec_late_fee": 1,
        "last_pymnt_amnt":    50,
        "out_prncp":          500,
        "tot_cur_bal":        10000,
        "loan_amnt":          1000,
    },
    output_path="src/population_distribution.json",
    max_buckets=20,
)