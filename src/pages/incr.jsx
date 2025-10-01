import { useState } from "react";

export default function CounterApp() {

const [count, setCount] = useState(0);

const inr = () =>{
    setCount(count + 1);
};

const dec = () => {
    setCount(count - 1);
};

return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Counter: {count}</h1>
      <button onClick={increment} style={{ marginRight: "10px" }}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}