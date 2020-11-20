
'use strict';


/**
 * 파라미터로 이루어진 데이터를 표출하기 위해 관리하는 클래스.
 * @class Modeler
 * @constructor
 */
var Modeler = function(magoManager) 
{
	if (!(this instanceof Modeler)) 
	{
		throw new Error(Messages.CONSTRUCT_ERROR);
	}
	Emitter.call(this);
	this.magoManager = magoManager;
	
	/*
	 * Current modeler's mode. 
	 * @type {Enumeration}
	 * @default CODE.modelerMode.INACTIVE
	 */
	this.mode = CODE.modelerMode.INACTIVE; // test for the moment.
	this.drawingState = CODE.modelerDrawingState.NO_STARTED; // test for the moment.
	this.drawingElement = CODE.modelerDrawingElement.NOTHING; // test for the moment.
	
	// Test objects.***
	this.planeGrid; // sketch plane.
	this.polyLine2d; // current polyline2D to sketch.
	this.geoCoordsList; // class: GeographicCoordsList. geographic polyline.
	this.excavation; // class : Excavation.
	this.tunnel; // class : Tunnel.
	this.bSplineCubic3d;
	this.sphere; // class : Sphere.
	this.clippingBox;
	this.magoRectangle;
	
	this.testObjectsArray;
	
	this.objectsArray = []; // put here all objects.***
	this.vectorsArray; // put here vector objects (lines, polylines, etc.).***
	this.currentVisibleObjectsArray;

	// screenSpaceObjectsArray.***
	this.screenSpaceObjectsArray = [];
	
};
Modeler.EVENT_TYPE = {
	'ADD' : 'add'
}

Modeler.prototype = Object.create(Emitter.prototype);
Modeler.prototype.constructor = Modeler;

Modeler.prototype.extractObjectsByClassName = function(className, resultObjectsArray) 
{
	if (this.objectsArray === undefined)
	{ return resultObjectsArray; }
	
	if (resultObjectsArray === undefined)
	{ resultObjectsArray = []; }
	
	var objectsCount = this.objectsArray.length;
	for (var i=0; i<objectsCount; i++)
	{
		var object = this.objectsArray[i];
		if (object.constructor.name === className)
		{
			resultObjectsArray.push(object);
		}
	}
	
	return resultObjectsArray;
};

Modeler.prototype.newPipe = function(options) 
{
	var interiorRadius = options.interiorRadius;
	var exteriorRadius = options.exteriorRadius;
	var height = options.height;
	
	var pipe = new Pipe(interiorRadius, exteriorRadius, height, options);
	
	if (this.objectsArray === undefined)
	{ this.objectsArray = []; }
	
	this.objectsArray.push(pipe);
	return pipe;
};

Modeler.prototype.newTube = function(options) 
{
	var interiorRadius = options.interiorRadius;
	var exteriorRadius = options.exteriorRadius;
	var height = options.height;
	
	var tube = new Tube(interiorRadius, exteriorRadius, height, options);
	
	if (this.objectsArray === undefined)
	{ this.objectsArray = []; }
	
	this.objectsArray.push(tube);
	return tube;
};

/**
 * 모델러에 그려야할 객체 추가
 * @param {MagoRenderable} object
 * @param {number} depth Optional. 설정 시 해당 depth로 targetDepth 설정, targetDepth부터 화면에 나타남.
 */
Modeler.prototype.addObject = function(object, depth) 
{
	if (this.objectsArray === undefined)
	{ this.objectsArray = []; }

	// Check object's style.
	if (object instanceof MagoRectangle)
	{
		var style = object.style;
		if (style && style.clampToTerrain)
		{
			// put this object into tinTerrainManager.
			this.magoManager.tinTerrainManager.addObjectToClampToTerrain(object);
			return;
		}
	}

	this.objectsArray.push(object);
	
	var smartTileManager = this.magoManager.smartTileManager;
	// Note: the targetDepth must be calculated by the objects bbox size.
	var targetDepth = depth ? depth : 5;
	smartTileManager.putObject(targetDepth, object, this.magoManager);

	if (object.isNeedValidHeight(this.magoManager)) { this.magoManager._needValidHeightNativeArray.push(object); }

	this.emit(Modeler.EVENT_TYPE.ADD, {
		type :Modeler.EVENT_TYPE.ADD,
		timestamp : new Date().getTime(),
		add : object
	});
};

Modeler.prototype.__TEST__extrudedLines = function()
{
	if(!this.testLinesExtrude)
	{
		this.testLinesExtrude = true;
	}
	else{
		return;
	}
	var lines = [[[ 126.758036508042338, 37.542305898401864 ], [ 126.75775148613792, 37.541692212193048 ] ],
				[[ 126.758769422509161, 37.542090070073108 ], [ 126.758036508042338, 37.542305898401864 ] ],
				[[ 126.758561426641378, 37.542338644682935 ], [ 126.758144880926366, 37.542461308232014 ] ],
				[[ 126.758791307369776, 37.542655204235615 ], [ 126.758910714082361, 37.542620040681363 ], [ 126.759081681658884, 37.54259851339269 ], [ 126.760838413384135, 37.542081165430325 ], [ 126.760864491072283, 37.542036025101638 ], [ 126.760726323701718, 37.541738559244855 ], [ 126.760669633975766, 37.541717794397179 ], [ 126.758948126862094, 37.542224768337874 ] ],
				[[ 126.758144880926366, 37.542461308232014 ], [ 126.758301876414876, 37.542799330753596 ] ],
				[[ 126.758301876414876, 37.542799330753596 ], [ 126.758537735647963, 37.54272987604773 ] ],
				[[ 126.75647554642633, 37.542055541471022 ], [ 126.756989394247952, 37.543161942874065 ], [ 126.757025524532182, 37.543175178091303 ], [ 126.757580206269765, 37.543011842833288 ] ],
				[[ 126.755362953903898, 37.543238215626992 ], [ 126.755419643292868, 37.543258983015797 ], [ 126.756591857410484, 37.542913821031519 ], [ 126.756617937946601, 37.542868681656948 ], [ 126.756560240670623, 37.542744448522171 ], [ 126.756503551351059, 37.542723681679362 ], [ 126.755331339810141, 37.543068843708205 ], [ 126.755305258429502, 37.543113982794118 ], [ 126.755362953903898, 37.543238215626992 ] ],
				[[ 126.755533675057364, 37.543605819311836 ], [ 126.755590364771905, 37.543626586618537 ], [ 126.756762583879762, 37.543281422077477 ], [ 126.756788665573964, 37.543236282670428 ], [ 126.756725079626236, 37.543099374876761 ], [ 126.756668389992328, 37.543078608113227 ], [ 126.755496173639031, 37.543423770839759 ], [ 126.755470092232727, 37.543468909959266 ], [ 126.755533675057364, 37.543605819311836 ] ],
				[[ 126.755326719882319, 37.543666755803933 ], [ 126.755300638288588, 37.543711894883494 ], [ 126.753088306983216, 37.54436327511884 ], [ 126.753031617412745, 37.544342506614029 ], [ 126.75280321502872, 37.543850665368268 ], [ 126.752829298173936, 37.54380552684691 ], [ 126.755041615197101, 37.543154151352269 ], [ 126.755098304432551, 37.543174918895104 ], [ 126.755326719882319, 37.543666755803933 ] ],
				[[ 126.759942344748652, 37.542642855432589 ], [ 126.760823037569679, 37.542383493774651 ], [ 126.760900287524223, 37.542411789271185 ], [ 126.761080022331441, 37.542798741385894 ], [ 126.76119851677862, 37.543062290385677 ], [ 126.761310059307007, 37.543327756120505 ], [ 126.761414600992907, 37.543595022330955 ], [ 126.761512095977054, 37.54386397196788 ], [ 126.761602501484958, 37.544134487243618 ], [ 126.761685777845585, 37.544406449683521 ], [ 126.761761888509042, 37.544679740177926 ], [ 126.761741239006383, 37.544709453949615 ], [ 126.761000700537608, 37.544927539468063 ] ],
				[[ 126.751180734289335, 37.544958504341906 ], [ 126.752812310541628, 37.544478155971419 ], [ 126.75283839390211, 37.544433017453613 ], [ 126.752504429705439, 37.543713854683133 ], [ 126.756427019491127, 37.542558894483442 ], [ 126.756453100001593, 37.54251375514248 ], [ 126.756268596298085, 37.542116480548586 ] ],
				[[ 126.760788405707672, 37.544990058665562 ], [ 126.760199124136008, 37.545163594719227 ], [ 126.760162992330606, 37.545150359571231 ], [ 126.759127198735499, 37.54292036687665 ], [ 126.759153277748382, 37.542875226936872 ], [ 126.759730089511876, 37.54270536292907 ] ],
				[[ 126.759496160330102, 37.545370603540235 ], [ 126.759330108680473, 37.545013109049023 ], [ 126.759239285512407, 37.544895496941002 ], [ 126.758865914589919, 37.54409164380052 ], [ 126.75881925345297, 37.543913256453934 ], [ 126.758777819256736, 37.54382404966767 ] ],
				[[ 126.759247444116781, 37.543685758937883 ], [ 126.759956036599689, 37.54521130506005 ], [ 126.759939415411722, 37.545240074347632 ], [ 126.759496160330102, 37.545370603540235 ] ],
				[[ 126.751306758737755, 37.545151948996391 ], [ 126.751346443266868, 37.545237404738415 ], [ 126.75332045112502, 37.545490543650139 ] ],
				[[ 126.75332045112502, 37.545490543650139 ], [ 126.752952450976366, 37.54469810964504 ], [ 126.752906040371997, 37.544681107129421 ], [ 126.751306758737755, 37.545151948996391 ] ],
				[[ 126.759570451218579, 37.545536050857272 ], [ 126.760859874275894, 37.545156337395468 ] ],
				[[ 126.753326283778534, 37.544619819657633 ], [ 126.755420887653713, 37.544003100357635 ], [ 126.755452029335672, 37.544014508410527 ], [ 126.756122166380877, 37.545457429430208 ], [ 126.75614471193218, 37.545501075255203 ], [ 126.756171143184687, 37.545543316303345 ] ],
				[[ 126.753326283778534, 37.544619819657633 ], [ 126.753756620378383, 37.54554647160063 ] ],
				[[ 126.757673517224688, 37.543368619404376 ], [ 126.758699007812353, 37.545576523739861 ] ],
				[[ 126.758699007812353, 37.545576523739861 ], [ 126.758138617834447, 37.545741538232342 ], [ 126.758064003705329, 37.545760100898761 ], [ 126.757987391550543, 37.545772470850018 ], [ 126.75790958981122, 37.545778517553565 ], [ 126.757831419482343, 37.545778177202237 ], [ 126.757753705448678, 37.545771453387651 ], [ 126.756809292316589, 37.545650385921142 ], [ 126.756748027378762, 37.545639561829901 ], [ 126.756688777282491, 37.545623096660343 ], [ 126.756632358271261, 37.545601217241 ], [ 126.75657954758492, 37.545574224988357 ], [ 126.756531072751955, 37.545542491754155 ], [ 126.756487601566633, 37.545506454702547 ], [ 126.756449732889351, 37.545466610287356 ], [ 126.756417988396706, 37.545423507412615 ], [ 126.756392805395052, 37.545377739870482 ], [ 126.755722663826958, 37.543934821252357 ], [ 126.755736992161687, 37.54391002481303 ], [ 126.757070969831389, 37.543517228933503 ], [ 126.757241938840949, 37.543495704318438 ], [ 126.757673517224688, 37.543368619404376 ] ],
				[[ 126.750236896002178, 37.545697426792962 ], [ 126.750809540522596, 37.545770868661279 ] ],
				[[ 126.757270308721786, 37.54590569405277 ], [ 126.756770619196416, 37.545841636588548 ], [ 126.756694184024539, 37.54582867214603 ], [ 126.756619768131912, 37.545809667132936 ], [ 126.75654812248078, 37.545784813337391 ], [ 126.756479970075645, 37.545754361569877 ], [ 126.756415998666796, 37.54571861913216 ], [ 126.756356853809692, 37.545677946715898 ], [ 126.756303132350297, 37.545632754762586 ], [ 126.756255376401953, 37.54558349932136 ], [ 126.756214067874964, 37.545530677446607 ] ],
				[[ 126.758844893971599, 37.545740101357048 ], [ 126.758223006229201, 37.545923225912041 ], [ 126.758141160472931, 37.545944201801554 ], [ 126.758057361258167, 37.545959526576993 ], [ 126.757972222839328, 37.545969087906542 ], [ 126.757886369288215, 37.545972815704914 ], [ 126.757800429919101, 37.545970682647081 ], [ 126.757715034675329, 37.545962704368627 ], [ 126.757493748437255, 37.545934337231373 ] ],
				[[ 126.759789698233391, 37.546137401736033 ], [ 126.759784266774076, 37.546078455571056 ], [ 126.759717544417555, 37.545896530247056 ], [ 126.759646263038107, 37.545715704534096 ], [ 126.759570451218579, 37.545536050857272 ] ],
				[[ 126.759789698233391, 37.546137401736033 ], [ 126.761279612091201, 37.546328349575731 ] ],
				[[ 126.761521117688545, 37.546359299377414 ], [ 126.762105948514389, 37.546434244585235 ] ],
				[[ 126.761072236344873, 37.545093798385928 ], [ 126.761785474146492, 37.544883752815551 ], [ 126.76181728491342, 37.544897968948099 ], [ 126.761874156702177, 37.545144378759105 ], [ 126.76192522234895, 37.545391593487103 ], [ 126.761970463880544, 37.545639526401096 ], [ 126.762105948514389, 37.546434244585235 ] ],
				[[ 126.759972764202601, 37.546825027452151 ], [ 126.760550966068081, 37.546654760569929 ], [ 126.761399408595537, 37.546763493031648 ] ],
				[[ 126.761637825376908, 37.546794046221272 ], [ 126.762179115318986, 37.54686341068782 ] ],
				[[ 126.762179115318986, 37.54686341068782 ], [ 126.762229835868155, 37.547160919299607 ], [ 126.762192004308403, 37.547200368947792 ], [ 126.761739980712363, 37.547248023266469 ] ],
				[[ 126.760094884168467, 37.547421440024401 ], [ 126.760059508132898, 37.547221959362538 ], [ 126.760018795286243, 37.547023125003285 ], [ 126.759972764202601, 37.546825027452151 ] ]];

	// Now, create geoCoords.***
	var altAux = 3.0;
	var height = 10.0;
	var colorTop = new Color(1.0, 0.0, 0.0, 0.8);
	var colorBottom = new Color(0.0, 1.0, 0.0, 0.8);
	var options = {
		doubleFace : true,
		//colorBottom : colorBottom,
		//colorTop : colorTop,
		polyLineLoop : false,
		numSegments : 4,
		colorsArray : [new Color(1.0, 0.0, 0.0, 0.8), new Color(1.0, 1.0, 0.0, 0.8), new Color(0.0, 1.0, 0.0, 0.8), new Color(0.0, 1.0, 1.0, 0.8), new Color(0.0, 0.0, 1.0, 0.8)]
	};
	var polylinesCount = lines.length;
	for(var i=0; i<polylinesCount; i++)
	{
		var polyLine = lines[i];
		var geoCoordsList = new GeographicCoordsList();
		var pointsCount = polyLine.length;
		for(var j=0; j<pointsCount; j++)
		{
			var point = polyLine[j];
			var geoCoord = geoCoordsList.newGeoCoord(point[0], point[1], altAux);
		}

		// now, create the polyLine extruded.***
		
		var extrudedLine = geoCoordsList.getExtrudedWallRenderableObject(height, undefined, this.magoManager, undefined, options, undefined) ;
		extrudedLine.setOneColor(1.0, 0.5, 0.3, 1.0);
		extrudedLine.attributes.isSelectable = true;
		extrudedLine.attributes.isMovable = true;
		extrudedLine.attributes.selectedColor4 = new Color(1.0, 0.0, 0.0, 1.0);

		if (extrudedLine.options === undefined)
		{ extrudedLine.options = {}; }
		
		//extrudedLine.options.renderWireframe = true;
		extrudedLine.options.renderShaded = true; // bcos must be selectable.


		this.addObject(extrudedLine);
	}
	var hola = 0;

};

Modeler.prototype.__TEST__loftObjects = function()
{
	if(!this.testLinesExtrude)
	{
		this.testLinesExtrude = true;
	}
	else{
		return;
	}
	var lines = [[[ 126.758036508042338, 37.542305898401864 ], [ 126.75775148613792, 37.541692212193048 ] ],
				[[ 126.758769422509161, 37.542090070073108 ], [ 126.758036508042338, 37.542305898401864 ] ],
				[[ 126.758561426641378, 37.542338644682935 ], [ 126.758144880926366, 37.542461308232014 ] ],
				[[ 126.758791307369776, 37.542655204235615 ], [ 126.758910714082361, 37.542620040681363 ], [ 126.759081681658884, 37.54259851339269 ], [ 126.760838413384135, 37.542081165430325 ], [ 126.760864491072283, 37.542036025101638 ], [ 126.760726323701718, 37.541738559244855 ], [ 126.760669633975766, 37.541717794397179 ], [ 126.758948126862094, 37.542224768337874 ] ],
				[[ 126.758144880926366, 37.542461308232014 ], [ 126.758301876414876, 37.542799330753596 ] ],
				[[ 126.758301876414876, 37.542799330753596 ], [ 126.758537735647963, 37.54272987604773 ] ],
				[[ 126.75647554642633, 37.542055541471022 ], [ 126.756989394247952, 37.543161942874065 ], [ 126.757025524532182, 37.543175178091303 ], [ 126.757580206269765, 37.543011842833288 ] ],
				[[ 126.755362953903898, 37.543238215626992 ], [ 126.755419643292868, 37.543258983015797 ], [ 126.756591857410484, 37.542913821031519 ], [ 126.756617937946601, 37.542868681656948 ], [ 126.756560240670623, 37.542744448522171 ], [ 126.756503551351059, 37.542723681679362 ], [ 126.755331339810141, 37.543068843708205 ], [ 126.755305258429502, 37.543113982794118 ], [ 126.755362953903898, 37.543238215626992 ] ],
				[[ 126.755533675057364, 37.543605819311836 ], [ 126.755590364771905, 37.543626586618537 ], [ 126.756762583879762, 37.543281422077477 ], [ 126.756788665573964, 37.543236282670428 ], [ 126.756725079626236, 37.543099374876761 ], [ 126.756668389992328, 37.543078608113227 ], [ 126.755496173639031, 37.543423770839759 ], [ 126.755470092232727, 37.543468909959266 ], [ 126.755533675057364, 37.543605819311836 ] ],
				[[ 126.755326719882319, 37.543666755803933 ], [ 126.755300638288588, 37.543711894883494 ], [ 126.753088306983216, 37.54436327511884 ], [ 126.753031617412745, 37.544342506614029 ], [ 126.75280321502872, 37.543850665368268 ], [ 126.752829298173936, 37.54380552684691 ], [ 126.755041615197101, 37.543154151352269 ], [ 126.755098304432551, 37.543174918895104 ], [ 126.755326719882319, 37.543666755803933 ] ],
				[[ 126.759942344748652, 37.542642855432589 ], [ 126.760823037569679, 37.542383493774651 ], [ 126.760900287524223, 37.542411789271185 ], [ 126.761080022331441, 37.542798741385894 ], [ 126.76119851677862, 37.543062290385677 ], [ 126.761310059307007, 37.543327756120505 ], [ 126.761414600992907, 37.543595022330955 ], [ 126.761512095977054, 37.54386397196788 ], [ 126.761602501484958, 37.544134487243618 ], [ 126.761685777845585, 37.544406449683521 ], [ 126.761761888509042, 37.544679740177926 ], [ 126.761741239006383, 37.544709453949615 ], [ 126.761000700537608, 37.544927539468063 ] ],
				[[ 126.751180734289335, 37.544958504341906 ], [ 126.752812310541628, 37.544478155971419 ], [ 126.75283839390211, 37.544433017453613 ], [ 126.752504429705439, 37.543713854683133 ], [ 126.756427019491127, 37.542558894483442 ], [ 126.756453100001593, 37.54251375514248 ], [ 126.756268596298085, 37.542116480548586 ] ],
				[[ 126.760788405707672, 37.544990058665562 ], [ 126.760199124136008, 37.545163594719227 ], [ 126.760162992330606, 37.545150359571231 ], [ 126.759127198735499, 37.54292036687665 ], [ 126.759153277748382, 37.542875226936872 ], [ 126.759730089511876, 37.54270536292907 ] ],
				[[ 126.759496160330102, 37.545370603540235 ], [ 126.759330108680473, 37.545013109049023 ], [ 126.759239285512407, 37.544895496941002 ], [ 126.758865914589919, 37.54409164380052 ], [ 126.75881925345297, 37.543913256453934 ], [ 126.758777819256736, 37.54382404966767 ] ],
				[[ 126.759247444116781, 37.543685758937883 ], [ 126.759956036599689, 37.54521130506005 ], [ 126.759939415411722, 37.545240074347632 ], [ 126.759496160330102, 37.545370603540235 ] ],
				[[ 126.751306758737755, 37.545151948996391 ], [ 126.751346443266868, 37.545237404738415 ], [ 126.75332045112502, 37.545490543650139 ] ],
				[[ 126.75332045112502, 37.545490543650139 ], [ 126.752952450976366, 37.54469810964504 ], [ 126.752906040371997, 37.544681107129421 ], [ 126.751306758737755, 37.545151948996391 ] ],
				[[ 126.759570451218579, 37.545536050857272 ], [ 126.760859874275894, 37.545156337395468 ] ],
				[[ 126.753326283778534, 37.544619819657633 ], [ 126.755420887653713, 37.544003100357635 ], [ 126.755452029335672, 37.544014508410527 ], [ 126.756122166380877, 37.545457429430208 ], [ 126.75614471193218, 37.545501075255203 ], [ 126.756171143184687, 37.545543316303345 ] ],
				[[ 126.753326283778534, 37.544619819657633 ], [ 126.753756620378383, 37.54554647160063 ] ],
				[[ 126.757673517224688, 37.543368619404376 ], [ 126.758699007812353, 37.545576523739861 ] ],
				[[ 126.758699007812353, 37.545576523739861 ], [ 126.758138617834447, 37.545741538232342 ], [ 126.758064003705329, 37.545760100898761 ], [ 126.757987391550543, 37.545772470850018 ], [ 126.75790958981122, 37.545778517553565 ], [ 126.757831419482343, 37.545778177202237 ], [ 126.757753705448678, 37.545771453387651 ], [ 126.756809292316589, 37.545650385921142 ], [ 126.756748027378762, 37.545639561829901 ], [ 126.756688777282491, 37.545623096660343 ], [ 126.756632358271261, 37.545601217241 ], [ 126.75657954758492, 37.545574224988357 ], [ 126.756531072751955, 37.545542491754155 ], [ 126.756487601566633, 37.545506454702547 ], [ 126.756449732889351, 37.545466610287356 ], [ 126.756417988396706, 37.545423507412615 ], [ 126.756392805395052, 37.545377739870482 ], [ 126.755722663826958, 37.543934821252357 ], [ 126.755736992161687, 37.54391002481303 ], [ 126.757070969831389, 37.543517228933503 ], [ 126.757241938840949, 37.543495704318438 ], [ 126.757673517224688, 37.543368619404376 ] ],
				[[ 126.750236896002178, 37.545697426792962 ], [ 126.750809540522596, 37.545770868661279 ] ],
				[[ 126.757270308721786, 37.54590569405277 ], [ 126.756770619196416, 37.545841636588548 ], [ 126.756694184024539, 37.54582867214603 ], [ 126.756619768131912, 37.545809667132936 ], [ 126.75654812248078, 37.545784813337391 ], [ 126.756479970075645, 37.545754361569877 ], [ 126.756415998666796, 37.54571861913216 ], [ 126.756356853809692, 37.545677946715898 ], [ 126.756303132350297, 37.545632754762586 ], [ 126.756255376401953, 37.54558349932136 ], [ 126.756214067874964, 37.545530677446607 ] ],
				[[ 126.758844893971599, 37.545740101357048 ], [ 126.758223006229201, 37.545923225912041 ], [ 126.758141160472931, 37.545944201801554 ], [ 126.758057361258167, 37.545959526576993 ], [ 126.757972222839328, 37.545969087906542 ], [ 126.757886369288215, 37.545972815704914 ], [ 126.757800429919101, 37.545970682647081 ], [ 126.757715034675329, 37.545962704368627 ], [ 126.757493748437255, 37.545934337231373 ] ],
				[[ 126.759789698233391, 37.546137401736033 ], [ 126.759784266774076, 37.546078455571056 ], [ 126.759717544417555, 37.545896530247056 ], [ 126.759646263038107, 37.545715704534096 ], [ 126.759570451218579, 37.545536050857272 ] ],
				[[ 126.759789698233391, 37.546137401736033 ], [ 126.761279612091201, 37.546328349575731 ] ],
				[[ 126.761521117688545, 37.546359299377414 ], [ 126.762105948514389, 37.546434244585235 ] ],
				[[ 126.761072236344873, 37.545093798385928 ], [ 126.761785474146492, 37.544883752815551 ], [ 126.76181728491342, 37.544897968948099 ], [ 126.761874156702177, 37.545144378759105 ], [ 126.76192522234895, 37.545391593487103 ], [ 126.761970463880544, 37.545639526401096 ], [ 126.762105948514389, 37.546434244585235 ] ],
				[[ 126.759972764202601, 37.546825027452151 ], [ 126.760550966068081, 37.546654760569929 ], [ 126.761399408595537, 37.546763493031648 ] ],
				[[ 126.761637825376908, 37.546794046221272 ], [ 126.762179115318986, 37.54686341068782 ] ],
				[[ 126.762179115318986, 37.54686341068782 ], [ 126.762229835868155, 37.547160919299607 ], [ 126.762192004308403, 37.547200368947792 ], [ 126.761739980712363, 37.547248023266469 ] ],
				[[ 126.760094884168467, 37.547421440024401 ], [ 126.760059508132898, 37.547221959362538 ], [ 126.760018795286243, 37.547023125003285 ], [ 126.759972764202601, 37.546825027452151 ] ]];

	// The lines are the paths.
	var altAux = 3.0;
	var minX = -1.0, minY = 0.0, maxX = 1.0, maxY = 10.0;
	var profile2d = new Profile2D();
	var ring = profile2d.newOuterRing();
	var rect = ring.newElement("RECTANGLE");
	rect.setCenterPosition(0, 0);
	rect.setExtension(minX, minY, maxX, maxY);

	var bIncludeBottomCap = true, bIncludeTopCap = true;

	var polylinesCount = lines.length;
	for(var i=0; i<polylinesCount; i++)
	{
		var polyLine = lines[i];
		var geoCoordsList = new GeographicCoordsList();
		var pointsCount = polyLine.length;
		for(var j=0; j<pointsCount; j++)
		{
			var point = polyLine[j];
			var geoCoord = geoCoordsList.newGeoCoord(point[0], point[1], altAux);
		}

		// now, create the polyLine extruded.***
		////var extrudedLine = geoCoordsList.getExtrudedWallRenderableObject(height, undefined, this.magoManager, undefined, options, undefined) ;
		////extrudedLine.setOneColor(1.0, 0.5, 0.3, 1.0);
		////this.addObject(extrudedLine);
		//var path3d = new Path3D(geoCoordsList.geographicCoordsArray);
		var loftMesh = Modeler.getLoftMesh(profile2d, geoCoordsList.geographicCoordsArray, bIncludeBottomCap, bIncludeTopCap, this.magoManager);

		this.addObject(loftMesh);
	}
};

Modeler.prototype.__TEST__laser = function()
{
	if(!this.testLinesExtrude)
	{
		this.testLinesExtrude = true;
	}
	else{
		return;
	}

	// Create a geoCoordsSegment.
	var geoCoord_start = new GeographicCoord(126.75739575423393, 37.54300516583088, 19.133160613985577);
	var geoCoord_end = new GeographicCoord(126.75719736534053, 37.54493737467032, 44.055231264041986);
	var options = {};

	var renderable = GeographicCoordsList.getRenderableObjectOfGeoCoordsArray([geoCoord_start, geoCoord_end], this.magoManager, options);
	this.addObject(renderable);

	// Now, detect the intersected point by the laser.
	var str_WC = ManagerUtils.geographicCoordToWorldPoint(geoCoord_start.longitude, geoCoord_start.latitude, geoCoord_start.altitude, undefined);
	var end_WC = ManagerUtils.geographicCoordToWorldPoint(geoCoord_end.longitude, geoCoord_end.latitude, geoCoord_end.altitude, undefined);

	// Take the start-point as camera position.
	var cameraOptions = {
		name : "laserCamera"
	};
	var laserCamera = new Camera(cameraOptions);


	// calculate camera direction.
	var camDir = str_WC.getVectorToPoint(end_WC, undefined);
	camDir.unitary();

	// calculate camera right.
	var earthNormal = Globe.normalAtCartesianPointWgs84(str_WC.x, str_WC.y, str_WC.z, undefined);
	var camRight = camDir.crossProduct(earthNormal, undefined);

	// calculate camera up.
	var camUp = camRight.crossProduct(camDir, undefined);

	var hola = 0;
};

Modeler.getLoftMesh = function(profile2d, path, bIncludeBottomCap, bIncludeTopCap, magoManager) 
{
	// 1rst, create a VtxProfilesList.
	var vtxProfilesList = new VtxProfilesList();

	var resultRenderableObject = new RenderableObject();
	resultRenderableObject.geoLocDataManager = new GeoLocationDataManager();
	var geoLocData = resultRenderableObject.geoLocDataManager.newGeoLocationData();

	// Now, check the "path".
	// "path" can be: 
	// 1) geoCoordsArray.
	// 2) Path3D (BSplineCubic3D).
	// 3) others...
	//--------------------------------------
	var relativePoints3dArray;
	if(path instanceof Array)
	{
		// make the relativePoints3dArray.
		var geographicCoordsArray = path;

		// find the midGeoCoord.
		var midGeoCoord = GeographicCoordsList.getMiddleGeographicCoords(geographicCoordsArray, undefined);
		// All points3d is referenced to the middleGeoCoord.

		ManagerUtils.calculateGeoLocationData(midGeoCoord.longitude, midGeoCoord.latitude, midGeoCoord.altitude, 0, 0, 0, geoLocData);

		var wgs84Point3DArray = GeographicCoordsList.getGeoCoordsToWgs84Points3D(geographicCoordsArray, undefined);
		relativePoints3dArray = geoLocData.getTransformedRelativePositionsArray(wgs84Point3DArray, undefined);
	}
	else if(path instanceof Path3D)
	{
		// TODO:
		// pendent.
	}

	// Transform pathGeoCoordsList to cartesianPath(points3DList).
	//var wgs84Point3DArray = this.geoCoordsListPath.getWgs84Points3D(undefined);
	//relativePoints3dArray = geoLoc.getTransformedRelativePositionsArray(wgs84Point3DArray, undefined);
	
	var pathPoints3dList = new Point3DList(relativePoints3dArray);
	var bLoop = false; // this is a stringTypePath, no loopTypePath.
	
	// Provisionally make an circular profile in the 1rst point3d-plane.
	var bisectionPlane = pathPoints3dList.getBisectionPlane(0, undefined, bLoop);
	// Note: "bisectionPlane" is in local coordinate "geoLoc".
			
	// now, calculate the profile points.
	var ring = profile2d.outerRing;
	var resultPoints2dArray = [];
	var pointsCountFor360Deg = 24; // no used yet.
	ring.getPoints(resultPoints2dArray, pointsCountFor360Deg); // "pointsCountFor360Deg" no used yet.

	// Now, calculate the rotMatrix of the bisectionPlane, & calculate points3ds of the circle points2d.
	var rotMat4 = bisectionPlane.getRotationMatrix(undefined);
	var firstPoint3d = pathPoints3dList.getPoint(0);
	rotMat4.setTranslation(firstPoint3d.x, firstPoint3d.y, firstPoint3d.z);

	// Make the loft vtxProfilesList.
	//bLoop = true;
	
	//if (this.meshPositive === undefined)
	{
		vtxProfilesList.makeLoft(profile2d, pathPoints3dList, bLoop);
		
		// positive mesh.
		var bIncludeBottomCap = true;
		var bIncludeTopCap = true;
		var meshAux = vtxProfilesList.getMesh(undefined, bIncludeBottomCap, bIncludeTopCap, bLoop);
		var meshPositive = meshAux.getCopySurfaceIndependentMesh(undefined);
		var bForceRecalculatePlaneNormal = false;
		meshPositive.calculateVerticesNormals(bForceRecalculatePlaneNormal);
		meshPositive.setColor(0.1, 0.5, 0.5, 1.0);
		meshPositive.vboKeysContainer = meshPositive.getVbo(meshPositive.vboKeysContainer, magoManager.vboMemoryManager);
		meshPositive.vboKeysContainerEdges = meshPositive.getVboEdges(meshPositive.vboKeysContainerEdges, magoManager.vboMemoryManager);
		
		// negative mesh.
		////this.meshNegative = meshAux.getCopySurfaceIndependentMesh(this.meshNegative);
		////this.meshNegative.reverseSense(); // here calculates vertices normals.
		////this.meshNegative.setColor(0.1, 0.5, 0.5, 1.0);
		////this.meshNegative.getVbo(this.vboKeysContainer, magoManager.vboMemoryManager);
		////this.meshNegative.getVboEdges(this.vboKeysContainerEdges, magoManager.vboMemoryManager);
	}

	resultRenderableObject.objectsArray.push(meshPositive);
	return resultRenderableObject;

};

/**
 * 모델러에 객체 존재여부 반환
 * @param {MagoRenderable} object
 * @return {boolean} 
 */
Modeler.prototype.existObject = function(object)
{
	if (!this.objectsArray || (Array.isArray(this.objectsArray) && this.objectsArray.length === 0))
	{ return false; }

	// Check object's style.
	if (object instanceof MagoRectangle)
	{
		var style = object.style;
		if (style && style.clampToTerrain)
		{
			var find = this.magoManager.tinTerrainManager.objectsToClampToTerrainArray.filter(function(obj)
			{
				return obj !== object;
			});
			
			return find.length > 0;
		}
	}

	var find = this.objectsArray.filter(function(obj)
	{
		return obj !== object;
	});

	return find.length > 0;
};

/**
 * 모델러에 등록된 객체 삭제
 * @param {Object}
 */
Modeler.prototype.removeObject = function(target) 
{
	if (target === undefined)
	{ return false; }

	if (target instanceof MagoRectangle && target.style.clampToTerrain) 
	{
		this.magoManager.tinTerrainManager.removeObjectToClampToTerrain(target);
		target.deleteObjects(this.magoManager.vboMemoryManager);
		return;
	}
	target.deleteObjects(this.magoManager.vboMemoryManager);

	var tile = target.smartTileOwner;
	if (tile)
	{
		tile.nativeObjects.opaquesArray = tile.nativeObjects.opaquesArray.filter(function(opaq)
		{
			return opaq !== target;
		});
		
		tile.nativeObjects.transparentsArray = tile.nativeObjects.transparentsArray.filter(function(t)
		{
			return t !== target;
		});
	}
	
	this.objectsArray = this.objectsArray.filter(function(object)
	{
		return object !== target;
	});
};

/**
 * MagoRenderable 객체의 guid를 비교하여 같은 모델을 반환
 * @param {string} guid
 * @return {MagoRenderable}
 */
Modeler.prototype.getObjectByGuid = function(guid) {
	var model = this.objectsArray.filter(function(object)
	{
		return object._guid === guid;
	});

	return model[0];
}

/**
 * MagoRenderable 객체의 key/value를 비교하여 같은 모델을 반환
 * @param {string} key
 * @param {string} value
 * @return {Array<MagoRenderable>}
 */
Modeler.prototype.getObjectByKV = function(key, value) {
	var model = this.objectsArray.filter(function(object)
	{
		return object[key] === value;
	});

	return model;
}

Modeler.prototype.newPerson = function(options) 
{
	if (this.testObjectsArray === undefined)
	{ this.testObjectsArray = []; }
	
	var person = new AnimatedPerson();
	this.testObjectsArray.push(person);
	return person;
};

Modeler.prototype.newBasicFactory = function(factoryWidth, factoryLength, factoryHeight, options) 
{
	// set material for the roof of the factory.
	var magoManager = this.magoManager;
	var materialsManager = magoManager.materialsManager;
	var materialName = "basicFactoryRoof";
	var material = materialsManager.getOrNewMaterial(materialName);
	if (material.diffuseTexture === undefined)
	{ 
		material.diffuseTexture = new Texture(); 
		material.diffuseTexture.textureTypeName = "diffuse";
		material.diffuseTexture.textureImageFileName = "factoryRoof.jpg"; // Gaia3dLogo.png
		var imagesPath = materialsManager.imagesPath + "//" + material.diffuseTexture.textureImageFileName;
		var flipYTexCoord = true;
		TexturesManager.loadTexture(imagesPath, material.diffuseTexture, magoManager, flipYTexCoord);
	}
	
	// add options.
	if (options === undefined)
	{ options = {}; }
	
	options.roof = {
		"material": material
	};
	
	
	var basicFactory = new BasicFactory(factoryWidth, factoryLength, factoryHeight, options);
	basicFactory.bHasGround = true;
	
	if (this.objectsArray === undefined)
	{ this.objectsArray = []; }
	
	this.objectsArray.push(basicFactory);
	
	return basicFactory;
};

Modeler.getExtrudedSolidMesh = function(profile2d, extrusionDist, extrudeSegmentsCount, extrusionVector, bIncludeBottomCap, bIncludeTopCap, resultMesh) 
{
	if (profile2d === undefined || extrusionDist === undefined)
	{ return undefined; }
	
	var vtxProfilesList = new VtxProfilesList();
	
	// if want caps in the extruded mesh, must calculate "ConvexFacesIndicesData" of the profile2d before creating vtxProfiles.
	vtxProfilesList.convexFacesIndicesData = profile2d.getConvexFacesIndicesData(undefined);
	
	// create vtxProfiles.
	// make the base-vtxProfile.
	var baseVtxProfile = vtxProfilesList.newVtxProfile();
	baseVtxProfile.makeByProfile2D(profile2d);
	
	if (extrusionVector === undefined)
	{ extrusionVector = new Point3D(0, 0, 1); }
	
	var increDist = extrusionDist/extrudeSegmentsCount;
	for (var i=0; i<extrudeSegmentsCount; i++)
	{
		// test with a 1 segment extrusion.
		var nextVtxProfile = vtxProfilesList.newVtxProfile();
		nextVtxProfile.copyFrom(baseVtxProfile);
		nextVtxProfile.translate(0, 0, increDist*(i+1));
	}
	
	// must separate vbo groups by surfaces.
	resultMesh = vtxProfilesList.getMesh(resultMesh, bIncludeBottomCap, bIncludeTopCap);
	resultMesh.calculateVerticesNormals();
	
	return resultMesh;
};

Modeler.getExtrudedMesh = function(profile2d, extrusionDist, extrudeSegmentsCount, extrusionVector, bIncludeBottomCap, bIncludeTopCap, resultMesh) 
{
	if (profile2d === undefined || extrusionDist === undefined)
	{ return undefined; }

	var solidMesh = Modeler.getExtrudedSolidMesh(profile2d, extrusionDist, extrudeSegmentsCount, extrusionVector, undefined);
	resultMesh = solidMesh.getCopySurfaceIndependentMesh(resultMesh);
	resultMesh.calculateVerticesNormals();
	
	return resultMesh;
};

Modeler.getRevolvedSolidMesh = function(profile2d, revolveAngDeg, revolveSegmentsCount, revolveSegment2d, bIncludeBottomCap, bIncludeTopCap, resultMesh) 
{
	// Note: move this function into "VtxProfilesList" class.
	if (profile2d === undefined)
	{ return undefined; }

	var vtxProfilesList = new VtxProfilesList(); 
	
	// if want caps in the extruded mesh, must calculate "ConvexFacesIndicesData" of the profile2d before creating vtxProfiles.
	vtxProfilesList.convexFacesIndicesData = profile2d.getConvexFacesIndicesData(undefined);
	//profile2d.checkNormals();
	// create vtxProfiles.
	// make the base-vtxProfile.
	var baseVtxProfile = vtxProfilesList.newVtxProfile();
	baseVtxProfile.makeByProfile2D(profile2d);
	
	var increAngDeg = revolveAngDeg/revolveSegmentsCount;
	
	// calculate the translation.
	var line2d = revolveSegment2d.getLine();
	var origin2d = new Point2D(0, 0);
	var translationVector = line2d.getProjectedPoint(origin2d);
	translationVector.inverse();
	
	var rotMat = new Matrix4();
	var quaternion = new Quaternion();
	var rotAxis2d = revolveSegment2d.getDirection();
	var rotAxis = new Point3D(rotAxis2d.x, rotAxis2d.y, 0);
	rotAxis.unitary();
	
	for (var i=0; i<revolveSegmentsCount; i++)
	{
		// calculate rotation.
		quaternion.rotationAngDeg(increAngDeg*(i+1), rotAxis.x, rotAxis.y, rotAxis.z);
		rotMat.rotationByQuaternion(quaternion);
		
		// test top profile.
		var nextVtxProfile = vtxProfilesList.newVtxProfile();
		nextVtxProfile.copyFrom(baseVtxProfile);
		nextVtxProfile.translate(translationVector.x, translationVector.y, 0);
		nextVtxProfile.transformPointsByMatrix4(rotMat);
		nextVtxProfile.translate(-translationVector.x, -translationVector.y, 0);
	}
	
	resultMesh = vtxProfilesList.getMesh(resultMesh, bIncludeBottomCap, bIncludeTopCap);
	resultMesh.calculateVerticesNormals();
	
	return resultMesh;
};

Modeler.getPoints3DList_fromPoints3dArray = function(points3dArray, resultPoints3dList, options) 
{
	// 1rst, calculate the center point of the array.
	var bbox = new BoundingBox();
	bbox.init(points3dArray[0]);
	bbox.addPointsArray(points3dArray);
	
	// calculate the centerPos.
	var centerPos = bbox.getCenterPoint();
	
	// calculate geoLocationData.
	var geoLocData;
	
	// check options.
	if (options !== undefined && options.geoLocationData !== undefined)
	{
		// use the existent geoLocationData.
		geoLocData = options.geoLocationData;
	}
	else
	{
		// calculate geoLocationData by the centerPos of bbox.
		var geoCoord = ManagerUtils.pointToGeographicCoord(centerPos, undefined);
		geoLocData = ManagerUtils.calculateGeoLocationData(geoCoord.longitude, geoCoord.latitude, geoCoord.altitude, 0, 0, 0, undefined);
	}
	
	// calculate points3d relatives to the geoLocData.
	var relPoitsArray = geoLocData.getTransformedRelativePositionsArray(points3dArray, undefined);
	
	if (resultPoints3dList === undefined)
	{ resultPoints3dList = new Point3DList(); }
	
	resultPoints3dList.pointsArray = relPoitsArray;
	
	if (resultPoints3dList.geoLocDataManager === undefined)
	{ resultPoints3dList.geoLocDataManager = new GeoLocationDataManager(); }
	
	resultPoints3dList.geoLocDataManager.addGeoLocationData(geoLocData);
	return resultPoints3dList;
};

Modeler.prototype.getGeographicCoordsList = function() 
{
	if (this.geoCoordsList === undefined)
	{ this.geoCoordsList = new GeographicCoordsList(); }
	
	return this.geoCoordsList;
};

Modeler.prototype.getExcavation = function() 
{
	//if (this.excavation === undefined)
	//{ this.excavation = new Excavation(); }
	
	return this.excavation;
};

Modeler.prototype.getTunnel = function() 
{
	//if (this.tunnel === undefined)
	//{ this.tunnel = new Tunnel(); }
	
	return this.tunnel;
};

Modeler.prototype.addPointToPolyline = function(point2d) 
{
	if (this.polyLine2d === undefined)
	{ this.polyLine2d = new PolyLine2D(); }
	
	this.polyLine2d.newPoint2d(point2d.x, point2d.y);
};


Modeler.prototype.render = function(magoManager, shader, renderType, glPrimitive) 
{
	// Generic objects.***
	// The generic objects are into smartTiles, so is rendered when smartTile is visible on camera.
	
	// Render test objects.
	if (this.testObjectsArray !== undefined)
	{
		var testObjectsCount = this.testObjectsArray.length;
		for (var i=0; i<testObjectsCount; i++)
		{
			var testObject = this.testObjectsArray[i];
			testObject.render(magoManager);
		}
	}
	
	// 1rst, render the planeGrid if exist.
	if (this.planeGrid !== undefined)
	{
		this.planeGrid.render(magoManager, shader);
	}
	
	if (this.geoCoordsList !== undefined && renderType === 1)
	{
		// Provisionally render geographicPoints.
		if (this.geoCoordsList.points3dList !== undefined && this.geoCoordsList.points3dList.vboKeysContainer !== undefined)
		{
			//magoManager.clearCanvas2D();
			
			var bEnableDepth = true;
			var options = {};
			var thickLineShader = magoManager.postFxShadersManager.getShader("thickLine"); 
			thickLineShader.useProgram();
			
			// bind building geoLocationData.
			var gl = this.magoManager.getGl();
			gl.uniform1i(thickLineShader.bUseLogarithmicDepth_loc, magoManager.postFxShadersManager.bUseLogarithmicDepth);
			var sceneState = this.magoManager.sceneState;
			gl.uniform4fv(thickLineShader.oneColor4_loc, [0.9, 0.5, 0.3, 1.0]);
			gl.uniform2fv(thickLineShader.viewport_loc, [sceneState.drawingBufferWidth, sceneState.drawingBufferHeight]);
			gl.uniform1f(thickLineShader.thickness_loc, 5.0);
			this.geoCoordsList.points3dList.renderThickLines(magoManager, thickLineShader, renderType, bEnableDepth, options);
			
			shader.useProgram();
		}
		this.geoCoordsList.renderPoints(magoManager, shader, renderType);
	}
	
	if (this.excavation !== undefined)
	{
		this.excavation.renderPoints(magoManager, shader, renderType);
	}
	
	if (this.tunnel !== undefined)
	{
		this.tunnel.renderPoints(magoManager, shader, renderType);
	}
		
	if (renderType === 1 || renderType === 2)
	{
		if (this.clippingBox !== undefined)
		{
			var glPrimitive = undefined;
			var bIsSelected = false;
			this.clippingBox.render(magoManager, shader, renderType, glPrimitive, bIsSelected);
		}
	}
	
	if (this.bSplineCubic3d !== undefined)
	{
		if (renderType === 0)
		{
			shader = magoManager.postFxShadersManager.getShader("pointsCloudDepth");
			shader.useProgram();
			shader.disableVertexAttribArrayAll();
			shader.resetLastBuffersBinded();
			shader.enableVertexAttribArray(shader.position3_loc);
			shader.bindUniformGenerals();
		
			//gl.uniform1i(shader.bPositionCompressed_loc, false);
		}
		this.bSplineCubic3d.render(magoManager, shader, renderType);
	}
	
	if (this.sphere !== undefined)
	{
		this.sphere.render(magoManager, shader, renderType);
	}
	
	if (renderType === 0)
	{ return; }
	
	if (this.magoRectangle) 
	{
		this.magoRectangle.render(magoManager, shader, renderType, glPrimitive, bIsSelected);
	}

};

Modeler.prototype.createPlaneGrid = function(width, height, numCols, numRows) 
{
	// Test function.
	if (width === undefined)
	{ width = 500.0; }
	
	if (height === undefined)
	{ height = 500.0; }
	
	if (numCols === undefined)
	{ numCols = 50; }
	
	if (numRows === undefined)
	{ numRows = 50; }
	
	if (this.planeGrid === undefined)
	{
		this.planeGrid = new PlaneGrid(width, height, numCols, numRows);
	}
};