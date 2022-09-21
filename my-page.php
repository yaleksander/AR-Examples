<html>
<head>
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
	<meta content="utf-8" http-equiv="encoding">
	<title>Hello, AR Cube!</title>
	<!-- include three.js library -->
	<script src='js/three.js'></script>
	<!-- include jsartookit -->
	<script src="jsartoolkit5/artoolkit.min.js"></script>
	<script src="jsartoolkit5/artoolkit.api.js"></script>
	<!-- include threex.artoolkit -->
	<script src="threex/threex-artoolkitsource.js"></script>
	<script src="threex/threex-artoolkitcontext.js"></script>
	<script src="threex/threex-arbasecontrols.js"></script>
	<script src="threex/threex-armarkercontrols.js"></script>
</head>

<body style='margin : 0px; overflow: hidden; font-family: Monospace;'>

	<a id="files" style="display: none"><?php echo implode(";", array_diff(scandir("my-images/current"), array(".", "..", "contours.txt")));?></a>
	<a id="contours" style="display: none"><?php echo file_get_contents("my-images/current/contours.txt");?></a>
	<a id="text" style="color: red"></a>
	<a id="exportLink" href="#"></a>
	<script src="my-script.js"></script>

</body>
</html>