let requiemLines;

let textBodies = [];
let balls = [];
let engine;
let font;
let typeSize;

function preload() {
  requiemLines = loadStrings('requiem.txt');
  font = loadFont('w.otf');
}

function setup() {
  let canvas = createCanvas(850/1.5, 1100/1.5);
  textAlign(CENTER, BASELINE);
  textFont(font);
  typeSize = 16;
      
  engine = Matter.Engine.create();
  engine.world.gravity.y = 0.3;
  Matter.Runner.run(engine);
  
  for (let i = 0; i < requiemLines.length; i++) {
    let words = requiemLines[i].split(" ");
    let currentOffset = 0;
    let currentLetterOffset = 0;
    let prev = null;
    for (let j = 0; j < words.length; j++) {
      let wordWidth = textWidth(words[j]);
      let letters = words[j].split("");
      for (let k = 0; k < letters.length; k++) {
        let x = 70+currentLetterOffset+currentOffset;
        let y = 80+i*20;
        let letterWidth = textWidth(letters[k]);
        
        let bounds = font.textBounds(letters[k], x, y, typeSize);
        
        textBody = Matter.Bodies.rectangle(
          x + letterWidth/2, 
          y,
          letterWidth, bounds.h
        );
        
        textBody.letterValue = letters[k];
        textBody.originalX = textBody.position.x;
        textBody.originalY = textBody.position.y;
        
        textBody.restitution = 0.8;
        textBody.isStatic = true;
        
        textBody.letterValue = letters[k];
        if (k == 0) {
          textBody.lineStart = true;
        } else {
          textBody.lineStart = false;
        }
        
        Matter.World.add(engine.world, textBody);
        if (i == 22 || (i == 23 && j == 0 && k == 0) || (i == 23 && j == words.length - 1 && k == letters.length - 1)) {
          textBody.itIsDone = true;
        } else {
          textBody.itIsDone = false;
        }
        
        textBodies.push(textBody);
        
        if (prev) {
          let constraint = Matter.Constraint.create({
            bodyA: prev,
            bodyB: textBody,
            stiffness: 1
          })
          Matter.World.add(engine.world, constraint);
        }
        
        prev = textBody;
        
        currentLetterOffset += letterWidth + 1.75;
      }
      
      currentOffset += 3.75; 
      
    }
  }
  
  //Create boundaries
  let ground = Matter.Bodies.rectangle(width / 2, height+40, width*2, 100); 
  ground.isStatic = true;
  Matter.World.add(engine.world, ground);
  
  // let ceiling = Matter.Bodies.rectangle(width / 2, -5, width*2, 100); 
  // ground.isStatic = true;
  // Matter.World.add(engine.world, ceiling);
  
  let wallLeft = Matter.Bodies.rectangle(-50, height/2, 100, height*2);
  wallLeft.isStatic = true;
  Matter.World.add(engine.world, wallLeft);
  
  let wallRight = Matter.Bodies.rectangle(width+50, height/2, 100, height*2);
  wallRight.isStatic = true;
  Matter.World.add(engine.world, wallRight);
  
  //Mouse interaction
  var canvasmouse = Matter.Mouse.create(canvas.elt);
  canvasmouse.pixelRatio = pixelDensity();
  var options = {
    mouse: canvasmouse
  }
  
  mConstraint = Matter.MouseConstraint.create(engine, options);
  Matter.World.add(engine.world, mConstraint);
  
}
function draw() {
  randomSeed(100);
  background(0);
  textSize(typeSize);
  fill(255);
  noStroke();
  
  for (let ball of balls) {
    push();
    fill("#2D71EA");
    circle(ball.position.x, ball.position.y, 20);
    pop();
  }
  
  engine.world.gravity.x = (0.6*noise((frameCount+1000)/100)-0.3)*noise(frameCount);
  
  for (let i = 0; i < textBodies.length; i++) {
    let textBody = textBodies[i];
    push();
    translate(textBody.position.x, textBody.position.y);
    
    if (textBody.lineStart == false) {
      prev = textBodies[i - 1];
      v0 = createVector(textBody.position.x - prev.position.x, textBody.position.y - prev.position.y);
      textBody.constraintAngle = v0.heading();
    } else {
      next = textBodies[i + 1];
      v0 = createVector(next.position.x - textBody.position.x, next.position.y - textBody.position.y);
      textBody.constraintAngle = v0.heading();
    }
    rotate(textBody.constraintAngle);
    
    text(textBody.letterValue, 0, 0);  
    pop();
    
    if (balls.length > 0) {
      for (let j = 0; j < balls.length; j++) {
        if (Matter.Collision.collides(balls[j], textBodies[i]) != null && textBodies[i].itIsDone == false) {
          textBodies[i].isStatic = false;
        }
      }
      for (let k = 0; k < textBodies.length; k++) {
        if (i !== k && textBodies[i].itIsDone == false) {
          if (Matter.Collision.collides(textBodies[k], textBodies[i]) != null) {
            textBodies[i].isStatic = false;
          }
        }
      }
    }
  }
}

function mouseClicked() {
  ball = Matter.Bodies.circle(mouseX, mouseY, 10);
  ball.restitution = 1.2;
  ball.mass = 0.05;
  Matter.World.add(engine.world, ball);

  balls.push(ball);
  
}