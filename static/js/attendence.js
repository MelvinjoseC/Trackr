document.addEventListener("DOMContentLoaded", function () {
    const attendanceButton = document.getElementById("attendance-button");

    attendanceButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default link behavior

        // Open a new window
               // Window dimensions
    const width = 800;
    const height = 600;

    // Calculate the center position
    const screenLeft = window.screenLeft ?? window.screenX;
    const screenTop = window.screenTop ?? window.screenY;
    const screenWidth = window.innerWidth ?? document.documentElement.clientWidth;
    const screenHeight = window.innerHeight ?? document.documentElement.clientHeight;

    const left = screenLeft + (screenWidth - width) / 2;
    const top = screenTop + (screenHeight - height) / 2;

    // Open a new window
    const newWindow = window.open(
        "",
        "_blank",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes`
    );

        // Check if the new window was successfully opened
        if (newWindow) {
            // Write the content for the new window
            newWindow.document.open();
            newWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Edit Attendance</title>
                    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body {
                            background-color: #1a1a2e;
                            color: #fff;
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            background-color: #0f3460;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
                            max-width: 600px;
                            margin: 50px auto;
                        }
                        .form-control {
                            background-color: #162447;
                            color: #fff;
                            border: 1px solid #d13452;
                        }
                        .form-control::placeholder {
                            color: #bbb;
                        }
                        .form-control:focus {
                            background-color: #d13452;
                            color: #fff;
                            border: 1px solid #d13452;
                            box-shadow: none;
                        }
                        .btn-primary, .btn-secondary {
                            width: 48%;
                        }
                        .btn-primary:hover, .btn-secondary:hover {
                            background-color: #d13452;
                            border-color: #d13452;
                        }
                        .text-center h1 {
                            color: #fff;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="text-center mb-4">
                            <button onclick="window.close()" class="btn btn-secondary">Back</button>
                            <h1>Edit Attendance</h1>
                        </div>
                        <form method="post">
                            <div class="form-group">
                                <label for="id_date">Date:</label>
                                <input type="date" id="id_date" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="id_punch_in">Punch In:</label>
                                <input type="time" id="id_punch_in" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="id_punch_out">Punch Out:</label>
                                <input type="time" id="id_punch_out" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="id_break_time">Break Time:</label>
                                <input type="time" id="id_break_time" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="worktime">Total Work Time (Hours):</label>
                                <input type="text" id="worktime" name="worktime" class="form-control" readonly>
                            </div>
                            <div class="d-flex justify-content-between">
                                <button type="button" onclick="window.close()" class="btn btn-secondary">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </body>
                </html>
            `);
            newWindow.document.close();
        } else {
            alert("Please allow pop-ups for this website to view the attendance window.");
        }
    });
});
