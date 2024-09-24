import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import './App.css';
import { Card, Text } from "@mantine/core";
function App() {
    const [count, setCount] = useState(0);
    return (_jsx(_Fragment, { children: _jsx(Card, { shadow: 'lg', children: _jsx(Text, { italic: true, children: "Hello" }) }) }));
}
export default App;
