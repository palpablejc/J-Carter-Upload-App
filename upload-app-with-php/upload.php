<?php session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>DeliveredSecure</title>
  <link rel="stylesheet" href="./style/upload_style/style.css">
  <script src="https://unpkg.com/vue"></script>
  <script src="https://unpkg.com/axios@0.2.1/dist/axios.min.js"></script>

</head>
<body>
<!-- partial:index.partial.html -->
<body>
  <!-- partial:index.partial.html -->
  <link href='https://fonts.googleapis.com/css?family=Questrial' rel='stylesheet' type='text/css'>

  <canvas id="c"></canvas>
  <section class="main">
    <div class="inner-content">


      <body>
      <?php
        // display the message, if any, and then clear it
        //if (isset($_SESSION['msg'])) {
        //    echo $_SESSION['msg'] . "<br>";
        //    unset($_SESSION['msg']);
        //}
        //echo "<hr>";
        ?>

        <header>
            
          <h1>
            <img src="./img/irtc_logo_white_4096_INTUITIVEonly.png"> 
            <!-- <img src="https://gianlucaguarini.github.io/site-under-construction/demos/bower/assets/img/bower-logo.svg" /> -->
          </h1>
        </header>

        <div class="decide">
          <h1>DeliveredSecure</h1>
        </div>
        <h3 id="info">a DECIDE Platform Product</h3> <br>
        

        <div id="app">

          <!-- <h2></h2> -->
          <br />
          <div v-if="!file">
           <!-- <h3></h3> -->
            <!--<form onsubmit="return Validate(this);"> -->
            <input type="file" id="fileName" @change="onFileChange" onChange="printFileName()">
             <p hidden id="result"></p>
            <!--   </form>  -->
          </div>
          <div v-else>
            <p id="result"></p>
            <button v-if="!uploadURL" @click="removeFile">Remove file</button>
            <button v-if="!uploadURL" @click="uploadFile">Upload file</button>
          </div>
          <div v-if="uploadURL"> <h2 >File successfully uploaded</br></h2>
          <button onClick="window.location.href=window.location.href">Upload another file</button>
          </div>
          
        </div>

    </div>
</body>
</section>

</body>
<!-- partial -->
  <script  src="./script/upload_script/script.js"></script>

</body>
</html>