import pymysql
import pandas as pd

# MySQL connection
connection = pymysql.connect(
    host="localhost",
    user="root",
    password="varshith123",
    database="tasktracker"
)

# Path to the CSV file
csv_file_path = 'C:/Users/PC-047/Desktop/LIFTING AND RIGGING.csv'

# Read the entire CSV file into a pandas DataFrame
df = pd.read_csv(csv_file_path)

# Replace NaN with None
df = df.where(pd.notnull(df), None)

# Print the total number of rows
print(f"Total rows in CSV: {len(df)}")

try:
    with connection.cursor() as cursor:
        for _, row in df.iterrows():
            # Convert the row to a tuple
            row_tuple = tuple(row)

            # Debugging: Check the row and its length
            print(f"Row tuple: {row_tuple}")
            print(f"Tuple length: {len(row_tuple)}")

            # Ensure the SQL query matches the number of columns
            sql_query = """
            INSERT INTO tracker_project (
                title, d_no, scope, projects, rev, category, start, end, assigned, `group`, checker, qc3_checker,
                priority, task_status, review_3d, qc1, qc2, qc3, verification_status,
                phase_1_benchmark, phase_2_benchmark, phase_3_benchmark, phase_4_benchmark,
                phase_5_benchmark, phase_6_benchmark, phase_7_benchmark, phase_8_benchmark,
                phase_9_benchmark, phase_10_benchmark, task_benchmarK, mail_no, ref_no, list
            )
            VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON DUPLICATE KEY UPDATE
                d_no = VALUES(d_no),
                scope = VALUES(scope),
                projects = VALUES(projects),
                rev = VALUES(rev),
                category = VALUES(category),
                start = VALUES(start),
                end = VALUES(end),
                assigned = VALUES(assigned),
                `group` = VALUES(`group`),
                checker = VALUES(checker),
                qc3_checker = VALUES(qc3_checker),
                priority = VALUES(priority),
                task_status = VALUES(task_status),
                review_3d = VALUES(review_3d),
                qc1 = VALUES(qc1),
                qc2 = VALUES(qc2),
                qc3 = VALUES(qc3),
                verification_status = VALUES(verification_status),
                phase_1_benchmark = VALUES(phase_1_benchmark),
                phase_2_benchmark = VALUES(phase_2_benchmark),
                phase_3_benchmark = VALUES(phase_3_benchmark),
                phase_4_benchmark = VALUES(phase_4_benchmark),
                phase_5_benchmark = VALUES(phase_5_benchmark),
                phase_6_benchmark = VALUES(phase_6_benchmark),
                phase_7_benchmark = VALUES(phase_7_benchmark),
                phase_8_benchmark = VALUES(phase_8_benchmark),
                phase_9_benchmark = VALUES(phase_9_benchmark),
                phase_10_benchmark = VALUES(phase_10_benchmark),
                task_benchmarK = VALUES(task_benchmarK),
                mail_no = VALUES(mail_no),
                ref_no = VALUES(ref_no),
                list = VALUES(list)
            """
            # Execute the query
            cursor.execute(sql_query, row_tuple)

        # Commit the transaction
        connection.commit()
        print(f"All {len(df)} rows inserted/updated successfully in MySQL table.")
except Exception as e:
    print("Error:", e)
finally:
    connection.close()
