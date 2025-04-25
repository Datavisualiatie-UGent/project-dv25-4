#!/usr/bin/env python3
import pandas as pd
import sys
import json

# 1. Load your Parquet dataset
#    Ensure the path matches your project structure (e.g., docs/data-files/)
df = pd.read_parquet("./src/data/df_arabica_clean.parquet")

parameters = [
    "Aroma",
    "Flavor",
    "Acidity",
    "Body",
    "Balance",
    "Aftertaste",
    "Sweetness",
]

mean_df = df.groupby("Country of Origin")[parameters].mean().reset_index()
# 2. Convert the DataFrame to a dictionary
means = mean_df.to_dict(orient="records")

# 3. Write the JSON payload to stdout
json.dump(means, sys.stdout)
