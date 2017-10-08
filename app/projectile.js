//leapmotion handclosed
var health = 100
var damage = 10
var enemyfreq = 5200
var score = 0

var leap = new THREE.LeapMotion();
AFRAME.registerComponent('spawner', {
  schema: {
    on: {
      default: 'click'
    },
    mixin: {
      default: ''
    }
  },

  init: function() {
    
    
      //this.leap = leap;
      leap.registerEventHandler(
      THREE.LeapMotion.Events.HAND_STARTED_PUSHING_SCREEN,
      this.spawn.bind(this));
  },
  /**
   * Add event listener to entity that when emitted, spawns the entity.
   */
  

  update: function(oldData) {
    this.el.addEventListener(this.data.on, this.spawn.bind(this));
  },

  /**
   * Spawn new entity with a mixin of components at the entity's current position.
   */
  spawn: function() {
    var el = this.el;
    var entity = document.createElement('a-entity');
    var matrixWorld = el.object3D.matrixWorld;
    var position = new THREE.Vector3();
    var rotation = el.getAttribute('rotation');
    var entityRotation;
    

    // Have the spawned entity face the same direction as the entity.
    // Allow the entity to further modify the inherited rotation.
    position.setFromMatrixPosition(matrixWorld);
    entity.setAttribute('position', position);
    entity.setAttribute('mixin', this.data.mixin);
    entity.addEventListener('loaded', function() {
      entityRotation = entity.getAttribute('rotation');
      entity.setAttribute('rotation', {
        x: entityRotation.x + rotation.x,
        y: entityRotation.y + rotation.y,
        z: entityRotation.z + rotation.z
      });
    });
    el.sceneEl.appendChild(entity);
  }
});

AFRAME.registerComponent('click-listener', {
  // When the window is clicked, emit a click event from the entity.
  init: function() {
    var el = this.el;
    window.addEventListener('click', function() {
      el.emit('click', null, false);
    });
  }
});



AFRAME.registerComponent('projectile', {
  schema: {
    speed: { default: 0.05 }
  },
  tick: function (t) {
    //console.log(t);
    var speed = this.data.speed;
    this.el.object3D.translateY( -speed );
    var entity = this.el;
    if (t > 1000) { this.el.removeObject3D(); } 
  }
});

AFRAME.registerComponent('move-toward-camera', {
  schema: {
    speed: { default: 0.01 },
    min: {
      default: {
        x: -10,
        y: 1,
        z: -10
      },
      type: 'vec3'
    },
    max: {
      default: {
        x: 10,
        y: 1,
        z: 10
      },
      type: 'vec3'
    }
  }, 
  tick: function(t) {
    var data = this.data;
    var max = data.max;
    var min = data.min;

    var speed = this.data.speed || 0.01;
    //.object3D.translateZ( speed );
    var entity = this.el;
    var cameraPos = document.getElementById('player').object3D.position,
        position = this.el.object3D.position;
    console.log("pls", cameraPos.z - position.z)
    if (cameraPos.z - position.z < 1 && !entity.removed) { // TODO: Handle point/ health deduction state here
      entity.removed = true;
      var deathPlane = document.getElementById('death-plane');
      deathPlane.setAttribute('opacity', 0.2);
      health -= damage
      if (health <= 0) {
        console.log('dead', deathPlane)
        health = 100
        damage = 10
        enemyfreq = 5200
        score = 0
      }
      setTimeout(() => {
        deathPlane.setAttribute('opacity', 0);
      }, 200);
    } else if (!entity.removed) {
      var x = Math.random() * (max.x - min.x) + min.x,
     y = Math.random() * (max.y - min.y) + min.y;
    var finalPos = new THREE.Vector3(x, y, -position.z);
      console.log(finalPos, speed)
    this.el.object3D.translateOnAxis(finalPos, speed);
    } else {
      setTimeout( () => {
        if(this.el) {
          var sphere = this.el;
          if(sphere && sphere.parentNode) {
            sphere.parentNode.removeChild(sphere);
          sphere.removeObject3D();
          }
          
          
        }
        
        
      }, 400)
      
      
    }
    


    
    //this.el.object3D.translateY((position.y - y) / y);


  }
  
})

setInterval(function generateEnemies() {
  var sceneEl = document.querySelector('a-scene'); 
  var player = document.getElementById('player');
      var cameraPos = document.getElementById('player').object3D.position;
      //console.log('make enemies', this);
      //this.frameCount++;

    // Have the spawned entity face the same direction as the entity.
    // Allow the entity to further modify the inherited rotation.
    //position.setFromMatrixPosition(matrixWorld);
    //entity.setAttribute('position', position);
      for(var i=0; i < 1; i++) {
        var max = {
          x: 6,
          y: 8, 
          z: cameraPos.z-60
        },
        min = {
          x: -6,
          y: -1, 
          z: cameraPos.z-20
        },
        newPos = {
          
              x: Math.random() * (max.x - min.x) + min.x,
              y: Math.random() * (max.y - min.y) + min.y,
              z: Math.random() * (max.z - min.z) + min.z
        
        }
        var position = new THREE.Vector3(newPos.x, newPos.y, newPos.z);
/*
        var enemy = document.createElement('a-entity');
            
        enemy.setAttribute('src', "#enemy-alien");
        enemy.setAttribute('class', 'enemy');

        var randomString = "min: -6 -1 " + (20) + "; max: 6 8 " + (60);
          console.log("pls", randomString)
            //enemy.setAttribute('random-position', randomString);

            enemy.setAttribute('transparent', "true");
            enemy.setAttribute('scale', "5 5 3");
            enemy.setAttribute('move-toward-camera', "true")
            enemy.setAttribute('position', position);
            player.appendChild(enemy);
        console.log("pls", enemy.getAttribute('position'))
        */
        var boxEl = document.createElement('a-sphere');
            boxEl.setAttribute('material', {color: '#EF2D5E'});
                    boxEl.setAttribute('class', "enemy");

            boxEl.setAttribute('position', position);
            boxEl.setAttribute('scale', "1 1 1");
            boxEl.setAttribute('move-toward-camera', "true")
        
        

            sceneEl.appendChild(boxEl);
            console.log(newPos, cameraPos)

      }
  
}, enemyfreq - 200);


AFRAME.registerComponent('collider', {
  schema: {
    target: { default: '' }
  },

  // Calc targets
  init: function () {
    console.log(this);
    var targetEls = this.el.sceneEl.querySelectorAll(".enemy");
    this.targets = [];
    for (var i=0; i<targetEls.length; i++) {
      this.targets.push(targetEls[i].object3D);
    }
    this.el.object3D.updateMatrixWorld();
  },

  // check collisions w/ cylinder
  tick: function (t) {
    var collisionResults;
    var directionVector;
    var el = this.el;
    var sceneEl = el.sceneEl;
    this.el.setAttribute('geometry', 'buffer: false;'); //issue
    var mesh = el.getObject3D('mesh');
    var object3D = el.object3D;
    var raycaster;
    var vertices = mesh.geometry.vertices;
    var bottomVertex = vertices[0].clone();
    var topVertex = vertices[vertices.length -1].clone();

    // calc positions of start and end of obj
    bottomVertex.applyMatrix4(object3D.matrixWorld);
    topVertex.applyMatrix4(object3D.matrixWorld);

    // direction vec from start to end of obj
    directionVector = topVertex.clone().sub(bottomVertex).normalize();

    // raycast for collision
    raycaster = new THREE.Raycaster(bottomVertex, directionVector, 1);
    collisionResults = raycaster.intersectObjects(this.targets, true);
    collisionResults.forEach(function (target, i) {
      // tell enemy it was hit
      target.object.el.emit('collider-hit', {target: el});
      target.object.el.removed = true;
      score += 1
      //console.log('Tis but a flesh wound', i);
    });
  }
});