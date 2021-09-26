const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } =
  Matter; //destructure from Matter

//define width and height of canvas
const width = 800;
const height = 600;

const engine = Engine.create();
const { world } = engine; //creating an engine gives you a world
const render = Render.create({
  element: document.body, //where do we want to show our matter world?
  engine: engine, //specify which engine to use
  options: {
    wireframes: false,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

//make things clickable and dragable
World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
  })
);

//walls
const walls = [
  Bodies.rectangle(400, 0, 800, 40, {
    isStatic: true,
  }),
  Bodies.rectangle(400, 600, 800, 40, {
    isStatic: true,
  }),
  Bodies.rectangle(0, 300, 40, 600, {
    isStatic: true,
  }),
  Bodies.rectangle(800, 300, 40, 600, {
    isStatic: true,
  }),
];
World.add(world, walls); //add array of walls to world

//random shapes
for (let i = 0; i < 50; i++) {
  if (Math.random() > 0.5) {
    World.add(
      world,
      Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
    );
  } else {
    World.add(
      world,
      Bodies.circle(Math.random() * width, Math.random() * height, 35, {
        render: { fillStyle: "orange" },
      })
    );
  }
}

// //add a shape
// const shape = Bodies.rectangle(200, 200, 50, 50, {
//   isStatic: true,
// });
// World.add(world, shape);
