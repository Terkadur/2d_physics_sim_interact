particles = [];
play = true;
let nm, nx, ny, nvx, nvy, r;
function setup() {
  createCanvas(1152, 1152);
  _fr_ = 64;
  frameRate(_fr_);
  _cpt_ = 100; //calcs per tick
  _scale_ = 32;
  // -----------------------  i, m,   x,  y,  v_x, v_y, r
  particles[0] = new Particle(0, 1,   2,  6,  0,   0,  1);
  particles[1] = new Particle(1, 4,   16, 9,  0,   0,   2);
  particles[2] = new Particle(2, 9,   19, 17, 0,   0,   5);
  particles[3] = new Particle(3, 12,   8,  10, 12,   -17,   6);
  particles[4] = new Particle(4, 5,   12, 27,  0,   0,   3);
  
  nm = createInput();
  nm.position(64, 32);
  nm.size(64);
  
  nx = createInput();
  nx.position(192, 32);
  nx.size(64);
  
  ny = createInput();
  ny.position(320, 32);
  ny.size(64);
  
  nvx = createInput();
  nvx.position(448, 32);
  nvx.size(64);
  
  nvy = createInput();
  nvy.position(576, 32);
  nvy.size(64);
  
  nr = createInput();
  nr.position(704, 32);
  nr.size(64);
}


function draw() {
  
  //walls
  background(196);
  fill(0);
  strokeWeight(0);
  rect(64, 64, width - 128, height - 128);
  
  stroke(0);
  textAlign(LEFT, TOP);
  textSize(24);
  text("Mass:", 64, 8);
  text("X:", 192, 8);
  text("Y:", 320, 8);
  text("V_X:", 448, 8);
  text("V_Y:", 576, 8);
  text("Radius:", 704, 8);
  
  strokeWeight(4);
  for (let n = 64; n <= width - 64; n += _scale_) {
    line(n, height - 64, n, height - 48);
  }
  for (let n = 64; n <= height - 64; n += _scale_) {
    line(48, n, 64, n);
  }
  
  //move particles
  if (play) {
    for (let j = 0; j < _cpt_; j++) {
      for (let i = 0; i < particles.length; i++) {
        particles[i].move();
      }
    }
  }
  
  //show particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].show();
  }
}

function Particle(i, m, x, y, v_x, v_y, r) {
  this.i = i;
  this.m = m;
  this.x = x;
  this.y = y;
  this.v_x = v_x;
  this.v_y = v_y;
  this.r = r;
  
  this.show = function() {
    let _x_ = this.x*_scale_ + 64;
    let _y_ = height - (this.y*_scale_ + 64);
    let _r_ = this.r*_scale_;
    
    strokeWeight(0);
    fill(255);
    ellipse(_x_, _y_, 2*_r_);
    
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(0);
    text(this.m, _x_, _y_);
  };
  
  this.move = function() {
    if (this.x < 0 + this.r || this.x > 32 - this.r) {
      this.v_x *= -1;
    }
    
    if (this.y < 0 + this.r|| this.y > 32 - this.r) {
      this.v_y *= -1;
    }
    this.collide();
    this.x += this.v_x/(_fr_*_cpt_);
    this.y += this.v_y/(_fr_*_cpt_);
  };
  
  this.collide = function() {
    for (let j = 0; j < particles.length; j++) {
      let that = particles[j];
      if (j <= this.i) {
        continue;
      }
      
      let _r_ = this.r + that.r;
      
      if (dist(this.x, this.y, that.x, that.y) <= _r_) {
        let phi = atan2(that.y - this.y, that.x - this.x);
        
        let this_v = dist(0, 0, this.v_x, this.v_y);
        let this_theta = atan2(this.v_y, this.v_x);
        let this_lambda = this_theta - phi;
        let this_a = this_v * cos(this_lambda);
        let this_b = this_v * sin(this_lambda);
        
        let that_v = dist(0, 0, that.v_x, that.v_y);
        let that_theta = atan2(that.v_y, that.v_x);
        let that_lambda = that_theta - phi;
        let that_a = that_v * cos(that_lambda);
        let that_b = that_v * sin(that_lambda);
        
        let p = this.m*this_a + that.m*that_a;
        let K = 0.5*(this.m*this_a*this_a + that.m*that_a*that_a);
        
        let A = 0.5*this.m + 0.5*this.m*this.m/that.m;
        let B = -p*this.m/that.m;
        let C = 0.5*p*p/that.m - K;
        let poss = quad_form(A, B, C);
        
        if (abs(poss[0] - this_a) < abs(poss[1] - this_a)) {
          this_a = poss[1];
        } else {
          this_a = poss[0];
        }
        
        that_a = (p - this.m*this_a)/that.m;
        
        this_v = dist(0, 0, this_a, this_b);
        this_lambda = atan2(this_b, this_a);
        this_theta = this_lambda + phi;
        this.v_x = this_v * cos(this_theta);
        this.v_y = this_v * sin(this_theta);
        
        that_v = dist(0, 0, that_a, that_b);
        that_lambda = atan2(that_b, that_a);
        that_theta = that_lambda + phi;
        that.v_x = that_v * cos(that_theta);
        that.v_y = that_v * sin(that_theta);
      }
    }
  };
}

function quad_form(a, b, c) {
  numer1 = -b;
  numer2 = sqrt(b*b - 4*a*c);
  denom = 2*a;
  
  return [(numer1 + numer2)/denom, (numer1 - numer2)/denom];
}

function keyTyped() {
  if (key == " ") {
    play = !play;
  }
}

function keyPressed() {
  if (keyCode == ENTER) {
    let M = parseFloat(nm.value());
    let X = parseFloat(nx.value());
    let Y = parseFloat(ny.value());
    let VX = parseFloat(nvx.value());
    let VY = parseFloat(nvy.value());
    let R = parseFloat(nr.value());
    particles.push(new Particle(particles.length, M, X, Y, VX, VY, R));
  }
}

function mousePressed() {
  if (!play) {
    for (let i = 0; i < particles.length; i++) {
      if (dist((mouseX-64)/_scale_, (height-mouseY-64)/_scale_, particles[i].x, particles[i].y) <= particles[i].r) {
        particles[i].x = 1000;
        particles[i].y = 1000;
      }
    }
  }
}
