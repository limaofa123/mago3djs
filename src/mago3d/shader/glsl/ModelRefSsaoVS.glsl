
	attribute vec3 position;
	attribute vec3 normal;
	attribute vec2 texCoord;
	attribute vec4 color4;
	
	uniform mat4 buildingRotMatrix; 
	uniform mat4 projectionMatrix;  
	uniform mat4 modelViewMatrix;
	uniform mat4 modelViewMatrixRelToEye; 
	uniform mat4 ModelViewProjectionMatrixRelToEye;
	uniform mat4 RefTransfMatrix;
	uniform mat4 normalMatrix4;
	uniform mat4 sunMatrix[2]; 
	uniform vec3 buildingPosHIGH;
	uniform vec3 buildingPosLOW;
	uniform vec3 sunPosHIGH[2];
	uniform vec3 sunPosLOW[2];
	uniform int sunIdx;
	uniform vec3 sunDirWC;
	uniform vec3 encodedCameraPositionMCHigh;
	uniform vec3 encodedCameraPositionMCLow;
	uniform vec3 aditionalPosition;
	uniform vec3 refTranslationVec;
	uniform int refMatrixType; // 0= identity, 1= translate, 2= transform
	uniform bool bApplySpecularLighting;
	uniform highp int colorType; // 0= oneColor, 1= attribColor, 2= texture.
	
	uniform bool bApplyShadow;

	varying vec3 vNormal;
	varying vec2 vTexCoord;  
	varying vec3 uAmbientColor;
	varying vec3 vLightWeighting;
	varying vec3 vertexPos;
	varying float applySpecLighting;
	varying vec4 aColor4; // color from attributes
	varying vec4 vPosRelToLight; 
	varying vec3 vLightDir; 
	varying vec3 vNormalWC; 
	varying float currSunIdx;  
	
	void main()
    {	
		vec4 rotatedPos;
		mat3 currentTMat;
		if(refMatrixType == 0)
		{
			rotatedPos = buildingRotMatrix * vec4(position.xyz, 1.0) + vec4(aditionalPosition.xyz, 0.0);
			currentTMat = mat3(buildingRotMatrix);
		}
		else if(refMatrixType == 1)
		{
			rotatedPos = buildingRotMatrix * vec4(position.xyz + refTranslationVec.xyz, 1.0) + vec4(aditionalPosition.xyz, 0.0);
			currentTMat = mat3(buildingRotMatrix);
		}
		else if(refMatrixType == 2)
		{
			rotatedPos = RefTransfMatrix * vec4(position.xyz, 1.0) + vec4(aditionalPosition.xyz, 0.0);
			currentTMat = mat3(RefTransfMatrix);
		}

		vec3 objPosHigh = buildingPosHIGH;
		vec3 objPosLow = buildingPosLOW.xyz + rotatedPos.xyz;
		vec3 highDifference = objPosHigh.xyz - encodedCameraPositionMCHigh.xyz;
		vec3 lowDifference = objPosLow.xyz - encodedCameraPositionMCLow.xyz;
		vec4 pos4 = vec4(highDifference.xyz + lowDifference.xyz, 1.0);
		vec3 rotatedNormal = currentTMat * normal;
		
		currSunIdx = -1.0; // initially no apply shadow.
		if(bApplyShadow)
		{
			vLightDir = sunDirWC;
			vNormalWC = rotatedNormal;
						
			// the sun lights count are 2.
			
			vec3 currSunPosLOW;
			vec3 currSunPosHIGH;
			mat4 currSunMatrix;
			if(sunIdx == 0)
			{
				currSunPosLOW = sunPosLOW[0];
				currSunPosHIGH = sunPosHIGH[0];
				currSunMatrix = sunMatrix[0];
				currSunIdx = 0.5;
			}
			else if(sunIdx == 1)
			{
				currSunPosLOW = sunPosLOW[1];
				currSunPosHIGH = sunPosHIGH[1];
				currSunMatrix = sunMatrix[1];
				currSunIdx = 1.5;
			}
			
			// Calculate the vertex relative to light.***
			vec3 highDifferenceSun = objPosHigh.xyz - currSunPosHIGH.xyz;
			vec3 lowDifferenceSun = objPosLow.xyz - currSunPosLOW.xyz;
			vec4 pos4Sun = vec4(highDifferenceSun.xyz + lowDifferenceSun.xyz, 1.0);
			vec4 posRelToLightAux = currSunMatrix * pos4Sun;
			
			// now, check if "posRelToLightAux" is inside of the lightVolume (inside of the depthTexture of the light).
			vec3 posRelToLightNDC = posRelToLightAux.xyz / posRelToLightAux.w;
			vPosRelToLight = posRelToLightAux;
		}

		
		vLightWeighting = vec3(1.0, 1.0, 1.0);
		uAmbientColor = vec3(0.8);
		vec3 uLightingDirection = vec3(0.6, 0.6, 0.6);
		vec3 directionalLightColor = vec3(0.7, 0.7, 0.7);
		vNormal = normalize((normalMatrix4 * vec4(rotatedNormal.x, rotatedNormal.y, rotatedNormal.z, 1.0)).xyz); // original.***
		vTexCoord = texCoord;
		float directionalLightWeighting = max(dot(vNormal, uLightingDirection), 0.0);
		vLightWeighting = uAmbientColor + directionalLightColor * directionalLightWeighting;
		
		if(bApplySpecularLighting)
			applySpecLighting = 1.0;
		else
			applySpecLighting = -1.0;

        gl_Position = ModelViewProjectionMatrixRelToEye * pos4;
		vertexPos = (modelViewMatrixRelToEye * pos4).xyz;
		//vertexPos = objPosHigh + objPosLow;
		
		if(colorType == 1)
			aColor4 = color4;
		gl_PointSize = 5.0;
	}