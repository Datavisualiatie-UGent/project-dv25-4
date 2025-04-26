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
    "Aftertaste",
    "Acidity",
    "Body",
    "Balance",
    "Uniformity",
    "Clean Cup",
    "Sweetness",
]

mean_df = df.groupby("Country of Origin")[parameters].mean().reset_index()

# Insert the mean of all countries at the front of the dataframe with country name "All"
# Calculate the mean of all countries' means
country_means_avg = mean_df[parameters].mean()
mean_df.loc[-1] = country_means_avg
mean_df.at[-1, "Country of Origin"] = "Mean"
mean_df.index = mean_df.index + 1  # Shift index
mean_df = mean_df.sort_index()  # Sort by index


counts = df.groupby("Country of Origin").size().reset_index(name="count")

mean_df = mean_df.merge(counts, on="Country of Origin", how="left")

mean_row = mean_df[mean_df["Country of Origin"] == "Mean"]
others = mean_df[mean_df["Country of Origin"] != "Mean"]

others = others.sort_values(by="count", ascending=False)

mean_df = pd.concat([mean_row, others], ignore_index=True).drop(columns="count")

means = mean_df.to_dict(orient="records")

json.dump(means, sys.stdout)
