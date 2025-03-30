import pandas as pd
import numpy as np
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def get_coffee_files():
    """Get list of coffee files and analyze which ones are complete."""
    # List files in working directory
    dir_files = pd.DataFrame({"files": os.listdir()})

    # Filter coffee files
    coffee_list = dir_files[dir_files["files"].str.contains("coffee")].reset_index(
        drop=True
    )

    # Split file names to extract coffee IDs and table names
    # FIX: Use named parameter 'n' instead of positional parameter
    coffee_list_split_temp = coffee_list["files"].str.split("_", n=2, expand=True)
    col1 = coffee_list_split_temp[0] + "_" + coffee_list_split_temp[1]
    coffee_list_split = pd.DataFrame(
        {"coffee": col1, "tables": coffee_list_split_temp[2]}
    )

    # Check which coffees don't have all 5 tables
    table_counts = coffee_list_split.groupby("coffee").count()
    incomplete_coffees = table_counts[table_counts["tables"] != 5]
    logger.info(f"Found {len(incomplete_coffees)} coffees with incomplete tables:")
    logger.info(incomplete_coffees)

    # Extract coffee IDs from incomplete_coffees
    incomplete_ids = []
    for coffee in incomplete_coffees.index:
        try:
            coffee_id = int(coffee.split("_")[1])
            incomplete_ids.append(coffee_id)
        except (ValueError, IndexError):
            logger.warning(f"Could not parse coffee ID from {coffee}")

    return incomplete_ids


def process_coffee_tables(coffee_id):
    """Process tables for a single coffee ID and return a consolidated dataframe."""
    try:
        # Check if all required files exist first
        required_files = [f"coffee_{coffee_id}_table_{i}.csv" for i in range(5)]
        if not all(os.path.exists(file) for file in required_files):
            missing_files = [
                file for file in required_files if not os.path.exists(file)
            ]
            logger.warning(
                f"Skipping coffee {coffee_id} due to missing files: {missing_files}"
            )
            return None

        # Read all tables
        df0 = pd.read_csv(f"coffee_{coffee_id}_table_0.csv")
        df1 = pd.read_csv(f"coffee_{coffee_id}_table_1.csv")
        df2 = pd.read_csv(f"coffee_{coffee_id}_table_2.csv")
        df3 = pd.read_csv(f"coffee_{coffee_id}_table_3.csv")
        df4 = pd.read_csv(f"coffee_{coffee_id}_table_4.csv")

        # Process table 1
        df1.columns = ["zero", "one", "two", "three", "four"]
        colnames1 = df1["one"].tolist()
        colnames2 = df1["three"].tolist()
        data1 = df1["two"].tolist()
        data2 = df1["four"].tolist()
        df1_processed = pd.DataFrame([data1 + data2], columns=(colnames1 + colnames2))

        # Process table 2
        df2.columns = ["zero", "one", "two", "three", "four"]
        colnames1 = df2["one"].tolist()
        colnames2 = df2["three"].tolist()
        data1 = df2["two"].tolist()
        data2 = df2["four"].tolist()
        df2_processed = pd.DataFrame([data1 + data2], columns=(colnames1 + colnames2))

        # Process table 3
        df3.columns = ["zero", "one", "two", "three", "four"]
        colnames1 = df3["one"].tolist()
        colnames2 = df3["three"].tolist()
        data1 = df3["two"].tolist()
        data2 = df3["four"].tolist()
        df3_processed = pd.DataFrame([data1 + data2], columns=(colnames1 + colnames2))

        # Process table 4
        df4.columns = ["zero", "one", "two"]
        colnames1 = df4["one"].tolist()
        data1 = df4["two"].tolist()
        df4_processed = pd.DataFrame([data1], columns=colnames1)

        # Combine all tables
        df = pd.concat(
            [df1_processed, df2_processed, df3_processed, df4_processed], axis=1
        )
        df = df.rename(columns={np.nan: "NA"})

        # Add coffee ID as a column
        df["coffee_id"] = coffee_id

        return df

    except Exception as e:
        logger.error(f"Error processing coffee {coffee_id}: {str(e)}")
        return None


def main(output_file="df_1_arabica.parquet", max_coffee_id=362):
    """Main function to process all coffee tables and save to parquet."""
    logger.info("Starting coffee data processing")

    # Get list of known incomplete coffees
    known_skips = get_coffee_files()

    # Add coffees that are known to be problematic from comments
    problem_coffees = [85, 87, 135, 185]
    for coffee_id in problem_coffees:
        if coffee_id not in known_skips:
            known_skips.append(coffee_id)

    logger.info(f"Will skip the following coffee IDs: {sorted(known_skips)}")

    # Process each coffee file
    df_list = []
    processed_count = 0
    skipped_count = 0

    for i in range(max_coffee_id):
        if i in known_skips:
            logger.info(f"Skipping coffee {i} (known issue)")
            skipped_count += 1
            continue

        df = process_coffee_tables(i)
        if df is not None:
            df_list.append(df)
            processed_count += 1
            if processed_count % 10 == 0:
                logger.info(f"Processed {processed_count} coffees so far...")
        else:
            skipped_count += 1

    logger.info(
        f"Processing complete. Processed: {processed_count}, Skipped: {skipped_count}"
    )

    # Check if we have any data to save
    if not df_list:
        logger.error(
            "No coffee data was successfully processed. Cannot create output file."
        )
        return

    # Combine all processed coffees and save
    try:
        df_final = pd.concat(df_list, axis=0, ignore_index=True)
        logger.info(f"Final dataframe shape: {df_final.shape}")
        logger.info(f"Final dataframe columns: {df_final.columns.tolist()}")

        # Save to parquet file
        df_final.to_parquet(output_file)
        logger.info(f"Data successfully saved to {output_file}")

        # Display sample of the data
        logger.info("Sample of processed data:")
        logger.info(df_final.head())

    except Exception as e:
        logger.error(f"Error saving final dataframe: {str(e)}")


if __name__ == "__main__":
    main()
