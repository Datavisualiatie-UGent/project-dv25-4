import os
import pandas as pd
import numpy as np


def safe_numeric_conversion(series, split_char=" ", position=0):
    """Extract numeric values from strings and convert to float."""
    try:
        # Extract the numeric part and convert to float
        # Fix: str.split() takes 1-2 positional args, but 'expand' must be a keyword arg
        numeric_values = series.str.split(split_char, n=1, expand=True)[position]
        return pd.to_numeric(numeric_values, errors="coerce")
    except (AttributeError, KeyError, ValueError) as e:
        print(f"Error converting values: {e}")
        return series


def clean_coffee_data(input_path, output_path):
    """Clean the coffee dataset and save the results."""
    # Check if input file exists
    if not os.path.exists(input_path):
        print(f"Error: Input file {input_path} not found.")
        return False

    print(f"Reading data from {input_path}")
    df = pd.read_parquet(input_path)
    print("Original data info:")
    df.info()

    # Rename and set ID column
    df.rename(columns={df.columns[0]: "ID"}, inplace=True)
    df["ID"] = pd.Series(range(df.shape[0]))

    # Drop NA column if it exists
    if "NA" in df.columns:
        df.drop("NA", axis="columns", inplace=True)

    # Standardize color values if column exists
    if "Color" in df.columns:
        df["Color"] = df["Color"].str.lower()

    # Convert defect columns to numeric
    for column in ["Category One Defects", "Category Two Defects"]:
        if column in df.columns:
            df[column] = safe_numeric_conversion(df[column])

    # Rename and convert moisture column
    if "Moisture" in df.columns:
        df.rename(columns={"Moisture": "Moisture Percentage"}, inplace=True)
        df["Moisture Percentage"] = safe_numeric_conversion(df["Moisture Percentage"])

    print("Cleaned data info:")
    df.info()

    # Create directory if it doesn't exist
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Save cleaned data
    df.to_parquet(output_path)
    print(f"Cleaned data saved to {output_path}")
    return True


if __name__ == "__main__":
    # Define input and output paths (use absolute paths or ensure relative paths work)
    input_file = os.path.join(
        os.path.dirname(__file__),
        ".",
        "df_1_arabica.parquet",
    )
    output_file = os.path.join(
        os.path.dirname(__file__),
        ".",
        "df_arabica_clean.parquet",
    )

    clean_coffee_data(input_file, output_file)
