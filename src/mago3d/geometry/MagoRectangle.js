'use strict';
/**
 * 중심점과 가로, 세로 길이를 가진 클래스
 * @exception {Error} Messages.CONSTRUCT_ERROR
 * 
 * @class MagoRectangle
 * @constructor
 */
var MagoRectangle = function(options) 
{
	MagoRenderable.call(this);
	if (!(this instanceof MagoRectangle)) 
	{
		throw new Error(Messages.CONSTRUCT_ERROR);
	}

	/**
	 * Minimum coord of this rectangle
	 * @type {GeographicCoord}
	 */
	this.minGeographicCoord;
    
	/**
	 * Maximum coord of this rectangle
	 * @type {GeographicCoord}
	 */
	this.maxGeographicCoord;
    
	if (options)
	{
		var altitude = options.altitude;
        
		if (options.minLongitude && options.minLatitude)
		{
			this.minGeographicCoord = new GeographicCoord(options.minLongitude, options.minLatitude, altitude);
		}

		if (options.maxLongitude && options.maxLatitude)
		{
			this.maxGeographicCoord = new GeographicCoord(options.maxLongitude, options.maxLatitude, altitude);
		}
		// Check if exist material (texture).
	}
};

MagoRectangle.prototype = Object.create(MagoRenderable.prototype);
MagoRectangle.prototype.constructor = MagoRectangle;

/**
 * Makes the geometry mesh.
 */
MagoRectangle.prototype.makeMesh = function(magoManager)
{
	// This function makes an ellipsoidal mesh for tiles that has no elevation data.
	var lonSegments, latSegments, altitude;
    
	// 1rst, determine the lonSegments & latSegments.***
	var minLonDeg = this.minGeographicCoord.longitude;
	var minLatDeg = this.minGeographicCoord.latitude;
	var maxLonDeg = this.maxGeographicCoord.longitude;
	var maxLatDeg = this.maxGeographicCoord.latitude;

	lonSegments = Math.floor((maxLonDeg - minLonDeg)*5.0);
	latSegments = Math.floor((maxLatDeg - minLatDeg)*5.0);
    
	if (lonSegments < 1)
	{ lonSegments = 1; }

	if (latSegments < 1)
	{ latSegments = 1; }
	altitude =  this.minGeographicCoord.altitude;

	var degToRadFactor = Math.PI/180.0;
	var minLon = minLonDeg * degToRadFactor;
	var minLat = minLatDeg * degToRadFactor;
	var maxLon = maxLonDeg * degToRadFactor;
	var maxLat = maxLatDeg * degToRadFactor;
	var lonRange = maxLon - minLon;
	var latRange = maxLat - minLat;
	
	var lonIncreDeg = lonRange/lonSegments;
	var latIncreDeg = latRange/latSegments;
	
	// calculate total verticesCount.
	var vertexCount = (lonSegments + 1)*(latSegments + 1);
	var lonArray = new Float32Array(vertexCount);
	var latArray = new Float32Array(vertexCount);
	var altArray = new Float32Array(vertexCount);
	this.texCoordsArray = new Float32Array(vertexCount*2);
	
	var currLon = minLon; // init startLon.
	var currLat = minLat; // init startLat.
	var idx = 0;
	var s, t;

	
	// check if exist altitude.
	var alt = 0;
	if (altitude)
	{ alt = altitude; }
	
	for (var currLatSeg = 0; currLatSeg<latSegments+1; currLatSeg++)
	{
		currLat = minLat + latIncreDeg * currLatSeg;
		if (currLat > maxLat)
		{ currLat = maxLat; }

		for (var currLonSeg = 0; currLonSeg<lonSegments+1; currLonSeg++)
		{
			currLon = minLon + lonIncreDeg * currLonSeg;
			
			if (currLon > maxLon)
			{ currLon = maxLon; }
			
			lonArray[idx] = currLon;
			latArray[idx] = currLat;
			// Now set the altitude.
			altArray[idx] = alt;

			// make texcoords CRS84.***
			s = (currLon - minLon)/lonRange;
			t = (currLat - minLat)/latRange;
			
			this.texCoordsArray[idx*2] = s;
			this.texCoordsArray[idx*2+1] = t;
			
			// actualize current values.
			idx++;
		}
	}
	
	this.cartesiansArray = Globe.geographicRadianArrayToFloat32ArrayWgs84(lonArray, latArray, altArray, this.cartesiansArray);
	
	// Make normals using the cartesians.***
	this.normalsArray = new Int8Array(vertexCount*3);
	var point = new Point3D();
	for (var i=0; i<vertexCount; i++)
	{
		point.set(this.cartesiansArray[i*3], this.cartesiansArray[i*3+1], this.cartesiansArray[i*3+2]);
		point.unitary();
		
		this.normalsArray[i*3] = point.x*126;
		this.normalsArray[i*3+1] = point.y*126;
		this.normalsArray[i*3+2] = point.z*126;
	}
	
	// finally make indicesArray.
	var numCols = lonSegments + 1;
	var numRows = latSegments + 1;
	var options = {
		bCalculateBorderIndices: true
	};
	var resultObject = GeometryUtils.getIndicesTrianglesRegularNet(numCols, numRows, undefined, undefined, undefined, undefined, undefined, options);
	this.indices = resultObject.indicesArray;
	this.southIndices = resultObject.southIndicesArray;
	this.eastIndices = resultObject.eastIndicesArray;
	this.northIndices = resultObject.northIndicesArray;
	this.westIndices = resultObject.westIndicesArray;
	
	this.westVertexCount = this.westIndices.length;
	this.southVertexCount = this.southIndices.length;
	this.eastVertexCount = this.eastIndices.length;
	this.northVertexCount = this.northIndices.length;
	
	// Calculate buildingPosHIGH & buildingPosLOW.************************************************************************************
	var resultGeographicCoord;
	resultGeographicCoord = GeographicCoord.getMidPoint(this.minGeographicCoord, this.maxGeographicCoord, resultGeographicCoord);
    
	var geoLocDataManager = new GeoLocationDataManager();
	var geoLocData = geoLocDataManager.newGeoLocationData();
	geoLocData = ManagerUtils.calculateGeoLocationData(resultGeographicCoord.longitude, resultGeographicCoord.latitude, resultGeographicCoord.altitude, undefined, undefined, undefined, geoLocData);
	// set the geoLocDataManager of the terrainScanner.
	this.geoLocDataManager = geoLocDataManager;
    
	// Note: the cartesianCoords are rotated, so :
	geoLocData.rotMatrix.Identity();
    
	// Make vbos.*** Make vbos.*** Make vbos.*** Make vbos.*** Make vbos.*** Make vbos.*** Make vbos.*** Make vbos.*** Make vbos.*** Make vbos.***
	if (this.cartesiansArray === undefined)
	{ return; }

	// rest the CenterPosition to the this.cartesiansArray.
	var coordsCount = this.cartesiansArray.length/3;
	for (var i=0; i<coordsCount; i++)
	{
		this.cartesiansArray[i*3] -= geoLocData.position.x;
		this.cartesiansArray[i*3+1] -= geoLocData.position.y;
		this.cartesiansArray[i*3+2] -= geoLocData.position.z;
	}
        
	var vboKeyContainer = new VBOVertexIdxCacheKeysContainer();;
	
	var vboKey = vboKeyContainer.newVBOVertexIdxCacheKey();
    
	var vboMemManager = magoManager.vboMemoryManager;
	
	// Positions.
	vboKey.setDataArrayPos(this.cartesiansArray, vboMemManager);

	
	// Normals.
	if (this.normalsArray)
	{
		vboKey.setDataArrayNor(this.normalsArray, vboMemManager);
	}
	
	// TexCoords.
	if (this.texCoordsArray)
	{
		vboKey.setDataArrayTexCoord(this.texCoordsArray, vboMemManager);
	}
		
	// Indices.
	vboKey.setDataArrayIdx(this.indices, vboMemManager);
    
	// Create a mesh.*******************************************************************************
	var mesh = new Mesh();
	mesh.vboKeysContainer = vboKeyContainer;

	this.objectsArray.push(mesh);
    
	this.setDirty(false);
};