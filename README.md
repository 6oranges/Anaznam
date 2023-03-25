# USU 4610 Midterm
This project is your midterm! There are 9 questions. The first 8 are pretty easy and are designed to remind you of the core mechanics. Question 9 is where the real midterm begins.

## Client
All of the questions live in the `client` folder. It has the following folder structure:
```
client
  | questions
  |--| Question1.tsx
  |--| Question2.tsx
  |--| Question3.tsx
  |--| Question4.tsx
  |--| Question5.tsx
  |--| Question6.tsx
  |--| Question7.tsx
  |--| Question8.tsx
  |--| Question9.tsx

```
Each of those components is where you will write the code that solves the problem present in each question. For question 9 you will also be writing some server side code as well.

### Setting up the client
1. `cd` into the client folder and run `yarn` (or `npm install`) to install the dependencies.

1. While still in the client folder run `yarn dev` or (`npm run dev`) to start the development server

1. Question 9 requires you to have your server running. So follow the steps to setup the server when you get to hat question.

### The questions
Open up the client by navigating to `http://localhost:5173`. You will see each question displayed on the page that describes what you need to do.

Go to the component for the question you are trying to solve and make the changes there. None of the components interact with eachother. So you should be able to safely make changes to one question without breaking another solution (unless you crash the how browser, obviously).

The questions are written plainly, there is no trick to understanding them. You can take anything the questions say at face value. If the question tells you to make a button, then you should make a button. Some of the question give you some freedom to decide how to implement. Feel free to do whatever makes sense to you as long as it meets the other requirements.

## Server
You should write all of your code for question 9 in the `src/index.ts` file, or in the `schema.prisma` file.

### Setting up the server
1. In the project root run `yarn` (or `npm install`) to install the dependencies.
1. In the project root run `yarn db:migrate` (or `npm run db:migrate`) to run the migrations. You will need do this after you have added the model for quesiton 9, this is because the migration will fail if you have no models in your schema.
1. In the project root run `yarn dev` (or `npm run dev`) to start the server


## Submit
When you are done, delete the node_modules folders in both the client folder and the root folder and zip up your solution and upload it to Canvas!

