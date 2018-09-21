/**
 * @author syt123450 / https://github.com/syt123450
 */

import { LineGroupGeometry } from "../../elements/LineGroupGeometry";

function MergeLineGroupController() {

	this.straightLineGroup = undefined;
	this.curveLineGroup = undefined;

}

MergeLineGroupController.prototype = {

	createBasicLineElement: function() {

		let lineMat = new THREE.LineBasicMaterial( {

			color: 0xffffff,
			opacity: this.minOpacity,
			transparent:true,
			vertexColors: THREE.VertexColors

		} );

		let straightLineGeo = new THREE.Geometry();
		straightLineGeo.dynamic = true;
		this.straightLineGroup = new THREE.Line( straightLineGeo, lineMat );

		let curveLineGeo = new THREE.Geometry();
		curveLineGeo.dynamic = true;
		this.curveLineGroup = new THREE.Line( curveLineGeo, lineMat );

	},

	getLineGroupParameters: function( selectedElement ) {

		this.scene.updateMatrixWorld();

		let straightLineColors = [];
		let straightLineVertices = [];

		let curveLineColors = [];
		let curveLineVertices = [];

		let relatedElements = this.getRelativeElements( selectedElement );

		let straightElements = relatedElements.straight;
		let curveElements = relatedElements.curve;

		let startPosition = selectedElement.getWorldPosition().sub( this.neuralGroup.getWorldPosition() );

		for ( let i = 0; i < straightElements.length; i++ ) {

			straightLineColors.push( new THREE.Color( this.color ) );
			straightLineColors.push( new THREE.Color( this.color ) );

			straightLineVertices.push( straightElements[ i ].getWorldPosition().sub( this.neuralGroup.getWorldPosition() ) );
			straightLineVertices.push( startPosition );

		}

		let forward = true;

		for ( let i = 0; i < curveElements.length; i++ ) {

			let startPos = startPosition;
			let endPos = curveElements[ i ].getWorldPosition().sub( this.neuralGroup.getWorldPosition() );

			let startEndDistance = startPos.y - endPos.y;

			let controlTranslateXVector;
			if ( startPos.x >= 0 ) {

				controlTranslateXVector = new THREE.Vector3( this.actualWidth + startEndDistance, 0, 0 );

			} else {

				controlTranslateXVector = new THREE.Vector3( - this.actualWidth - startEndDistance, 0, 0 );

			}

			let firstControlPointPos = startPos.clone().add( controlTranslateXVector );
			let secondControlPointPos = endPos.clone().add( controlTranslateXVector );

			let curve = new THREE.CubicBezierCurve3(

				startPos,
				firstControlPointPos,
				secondControlPointPos,
				endPos

			);

			let points = curve.getPoints( 50 );

			if ( forward ) {

				for ( let i = 0; i < points.length; i++ ) {

					curveLineVertices.push( points[ i ] );
					curveLineColors.push( new THREE.Color( this.color ) );

				}

			} else {

				for ( let i = points.length - 1; i >= 0; i-- ) {

					curveLineVertices.push( points[ i ] );
					curveLineColors.push( new THREE.Color( this.color ) );

				}

			}

			forward = !forward;

		}

		return {

			straight: {

				lineColors: straightLineColors,
				lineVertices: straightLineVertices

			},

			curve: {

				lineColors: curveLineColors,
				lineVertices: curveLineVertices

			}

		}

	},

	initLineGroup: function( selectedElement ) {

		let lineGroupParameters = this.getLineGroupParameters( selectedElement );
		let straightParameters = lineGroupParameters.straight;
		let curveParameters = lineGroupParameters.curve;

		let straightGroupGeometryHandler = new LineGroupGeometry(

			straightParameters.lineVertices,
			straightParameters.lineColors,
			this.minOpacity

		);

		this.straightLineGroup.geometry = straightGroupGeometryHandler.getElement();
		this.straightLineGroup.material.needsUpdate = true;

		this.neuralGroup.add( this.straightLineGroup );

		let curveGroupGeometryHandler = new LineGroupGeometry(

			curveParameters.lineVertices,
			curveParameters.lineColors,
			this.minOpacity

		);

		this.curveLineGroup.geometry = curveGroupGeometryHandler.getElement();
		this.curveLineGroup.material.needsUpdate = true;

		this.neuralGroup.add( this.curveLineGroup );

	},

	disposeLineGroup: function() {

		this.straightLineGroup.geometry.dispose();
		this.neuralGroup.remove( this.straightLineGroup );

		this.curveLineGroup.geometry.dispose();
		this.neuralGroup.remove( this.curveLineGroup );

	}

};

export { MergeLineGroupController };