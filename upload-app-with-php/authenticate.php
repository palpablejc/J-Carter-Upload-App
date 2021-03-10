<?php
// start the session
session_start();

// initialize variables using data from the form
$valid = false;
$user = $_POST["username"];
$pwd = $_POST['password'];
//$hash_pwd = password_hash($pwd, PASSWORD_DEFAULT);


// initialize database variables
$servername = "localhost";
$dbusername = "root";
$dbpassword = "";
$dbname = "deliveredsecure";

// Create connection
$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// select all rows associated with the user (should only be one)
$sql = "SELECT * FROM users WHERE username = '" . $user . "'";
$result = $conn->query($sql);

if ($result->num_rows == 1) {

    if ($row = $result->fetch_assoc()) {
        // check the password from the db against the encrypted password
        // from the form
        if (password_verify($pwd, $row["password"])) {
            //$msg = "Welcome<br>" ;
            $valid = true;
        } else {
            $msg = "Username and/or Password Invalid.";
        }
    
    } else {
        // Error getting row data
        $msg = "Username and/or Password Invalid.";
    }
} else {
    // user not found in the database
    $msg = "Username and/or Password Invalid.";
}
$conn->close();

// put the message into the session for later display on a web page
$_SESSION["msg"] = $msg;

if ($valid) {
    // put the authenticated user's name into the SESSION for later use
    $_SESSION['user'] = $user;

    // valid login, forward to the menu
    header("Location: upload.php");
} else {
    // invalid login, therefore forward back to the homepage
    header("Location: index.php");
}
?>
