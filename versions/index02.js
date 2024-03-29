const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter; //destructure from Matter

//define width and height of canvas
const width = window.innerWidth;
const height = window.innerHeight;
const cells = 3; //cells in the square

const unitLength = width / cells; //length of side of a cell

const engine = Engine.create();
engine.world.gravity.y = 0; // disable gravity
const { world } = engine; //creating an engine gives you a world
const render = Render.create({
  element: document.body, //where do we want to show our matter world?
  engine: engine, //specify which engine to use
  options: {
    wireframes: true,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

//walls
const walls = [
  //top
  Bodies.rectangle(width / 2, 0, width, 2, {
    isStatic: true,
  }),
  //bottom
  Bodies.rectangle(width / 2, height, width, 2, {
    isStatic: true,
  }),
  //left
  Bodies.rectangle(0, height / 2, 2, height, {
    isStatic: true,
  }),
  //right
  Bodies.rectangle(width, height / 2, 2, height, {
    isStatic: true,
  }),
];
World.add(world, walls); //add array of walls to world

//maze generation
const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter); // get random index inside array
    counter--;
    // swap elements at index of index and counter
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false));

const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
  // if i have visited the cell at [row, column], then return
  if (grid[row][column]) {
    return;
  }

  // mark this cell as visited
  grid[row][column] = true;

  // assemble randomly ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  // for each neighbor
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor; // destruct were we are going from neighbor
    // see if that neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cells ||
      nextColumn < 0 ||
      nextColumn >= cells
    ) {
      continue; // don't leave this for loop, but don't do anything else in this iteration
    }

    // if we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // remove a wall from verticals or horizontals
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    // visit that next cell recursively
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);

//iterate over horizontals and draw walls
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    //draw a wall segment
    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + unitLength,
      unitLength,
      10,
      {
        label: "wall",
        isStatic: true,
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    //draw a wall segment
    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      10,
      unitLength,
      { label: "wall", isStatic: true }
    );
    World.add(world, wall);
  });
});

// goal
const goal = Bodies.rectangle(
  width - unitLength / 2,
  height - unitLength / 2,
  unitLength * 0.7,
  unitLength * 0.7,
  { isStatic: true, label: "goal" }
);
World.add(world, goal);

// ball
const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength / 4, {
  label: "ball",
});
World.add(world, ball);

// move ball
document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity; // get current velocity

  // use keycode.info to see what the keycodes are for each key
  const { keyCode } = event;
  if (keyCode === 87) {
    Body.setVelocity(ball, { x, y: y - 5 }); // to move up, use negative velocity
  }
  if (keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y }); // right
  }
  if (keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + 5 }); // down
  }
  if (keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y }); // left
  }
});

// win condition
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      // iterate over world.bodies and update the static property of the walls
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
