import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Game from "./pages/Game";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/create" component={Create} />
        <Route path="/game/:gameId" component={Game} />
      </Switch>
    </>
  );
  //);
}

export default App;
