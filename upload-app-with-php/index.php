<?php session_start(); ?>

<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>Login</title>
  <link rel="stylesheet" href="./style.css">

</head>
<body>
<!-- partial:index.partial.html -->
<html>

<canvas id="c"></canvas>


<section class="main">

  <body>
    
    <h1 id="hi">Welcome</h1>

    <span id="content">
      <form action="test-authenticate.php" method="POST">
        <input type="text" name="username" placeholder="username">
        <br>

        <input type="password" name="password" placeholder="password">
        <br>
        <input type="submit" value="Login" />
      </form>
    </span>
    <?php
        // display the message, if any, and then clear it
        if (isset($_SESSION['msg'])) {
            echo "<div id='msg'>";
            echo $_SESSION['msg'] . "<br>";
            echo "</div>";
            unset($_SESSION['msg']);
        }
        //echo "<hr>";
        ?>

  </body>
</section>
<!-- partial -->
  <script  src="./script/login_script/script.js"></script>

</body>
</html>
