var API_KEY_PATH = "capoer/js/visionkey.txt";
var OCRChords = "Loading...";

function postCloudVision_api(img_url, key, callback) {
	var json = JSON.stringify(
		{
	      'requests': [
	        {
	          'image': {
	            'source': {
	              'imageUri': img_url
	            }
	          },
	          'features': [
	            {
	              'type': 'TEXT_DETECTION'	              
	            }
	          ]
	        }
	      ]
	    });//http://chordtabs.in.th/admin/admin/songsxx/c0003811.png	
	var http = new XMLHttpRequest();
	var vision_url = 'https://vision.googleapis.com/v1/images:annotate?key=' + key;
	http.open('POST', vision_url , true);
	http.setRequestHeader('Content-type', 'application/json');	
	var result;	
	http.onreadystatechange = function() {//Call a function when the state changes.		
		if(this.readyState == 4){
			if(this.status == 200) {
				//alert(this.responseText);
				var rawJSON = JSON.parse(this.responseText);
				result = callback(rawJSON);
			}
		}
	}
	http.send(json);
	return result;
}

function parseJSON(text) {
	return JSON.parse(text);
}

function sortPoints_vertical(lyricsPoints) {
	lyricsPoints.sort(function(a, b) {
		return a.y - b.y;
	});	
}

function sortPoints_horizontal(lyricsPoints) {
	lyricsPoints.sort(function(a, b) {
		return a.x - b.x;
	});
}

function sortLines(lines) {
	for (var line in lines) {
		sortPoints_horizontal(lines[line].points);
	}
}

function alignLines(lines) {
	var text = "";
	var line;
	var splitter;
	for (var l in lines) {
		line = lines[l];
		splitter = (line.points.length < 10) ? " ":"";
		for (var p in line.points) {
			text += line.points[p].text + splitter;
		}
		text += "\n";
	}
	return text;
}

function averageVertices(vertices, key) {
	var sum = 0;
	for (var v in vertices) {
		sum += vertices[v][key];		
	}
	var result = 1.0*sum/vertices.length;		
	return result;
}

function Point(jsonPoint) {
	//center position of a bounding box
	var vertices = jsonPoint['boundingPoly']['vertices']
	//$(".diff_score").val($(".diff_score").val() + JSON.stringify(vertices) + '\n');
	this.x = averageVertices(vertices, 'x');
	this.y = averageVertices(vertices, 'y');
	this.text = jsonPoint['description'];
}

function findLineBreakPoints (lyricsPoints) {
	//assume that points are vertically sorted
	var MAX_INLINE_DIFF = 5; //maximum shifted distance tolerated for points in the same line	
	var lineStartingPoint = 0;	
	var splitPoints = [];
	for (var p in lyricsPoints) {
		if (Math.abs(lyricsPoints[p].y - lyricsPoints[lineStartingPoint].y) > MAX_INLINE_DIFF){
			lineStartingPoint = p;
			splitPoints.push(parseInt(p));
		}
	}

	return splitPoints;
}

function makeLines(lyricsPoints) {
	var breakPoints = findLineBreakPoints(lyricsPoints);
	var currentLineEndPointPos = 0;
	var currentLineEndPoint = breakPoints[currentLineEndPointPos];
	var lines = [];
	var currentLine = new Line();

	for (var p in lyricsPoints) {		
		if (parseInt(p) < currentLineEndPoint) {
			currentLine.push(lyricsPoints[p]);
		}
		else {
			lines.push(currentLine);
			currentLineEndPointPos += 1;
			currentLineEndPoint = breakPoints[currentLineEndPointPos];
			currentLine = new Line();
			currentLine.push(lyricsPoints[p])			
		}
	}	
	return lines;
}

function Line() {
	//an array of Points that are in the same line
	this.points = [];
	this.push = function(point) {
		this.points.push(point);
	};
}

function OCRCallbackChain(url) {	
	var key = getAPIKey();
	var result = postCloudVision_api(url, key, function(rawJSON){
		var recon_result = reconstructLyrics(rawJSON);
		//returning value from callback seems impossible
		$(".original_chord").val(recon_result);		
	});	
	//alert(result);
	/*	
	TEST MODE
	var rawJSON = testJSON;
	var result = reconstructLyrics(rawJSON);
	*/
	return result;
}

function getAPIKey() {
	return "YOUR GOOGLE VISION API KEY";
	var x;
	$.get(API_KEY_PATH, function(response){x = response;});
	return x;
}

function reconstructLyrics(lyricsJSON) {
	var lyricsPoints = [];
	var rawPoints = lyricsJSON['responses'][0]['textAnnotations'];	
	var nBoxes = rawPoints.length
	for (var i = 1; i < nBoxes; i++ ) {
		lyricsPoints.push(new Point(rawPoints[i]));
	}	

	sortPoints_vertical(lyricsPoints);

	var lines = makeLines(lyricsPoints);	
	sortLines(lines);
	/*
	//FOR DEBUGGING PURPOSE
	for (var i in lines) {
		for (var j in lines[i].points){
			$(".diff_score").val($(".diff_score").val() + lines[i].points[j].x + ", " + lines[i].points[j].y+ '\n');		
		}		
		$(".diff_score").val($(".diff_score").val() + "--------------------------\n");		
	}
	*/
	var alignedLyrics = alignLines(lines);	
	return alignedLyrics;
}

function loadImageChord() {
	var img_url = $(".image_url").val();
	getChordtabsLyricsAsText(img_url);
}

function getChordtabsLyricsAsText(url) {
	OCRCallbackChain(url);
	$(".original_chord").val(OCRChords);
}