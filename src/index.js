import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Home from "./pages/home";
import Topholders from "./pages/topholders";
import Liquiditypools from "./pages/liquiditypools";
import Farmingpools from "./pages/farmingpools";
import Fees from "./pages/fees";
import Address from "./pages/address";
import Governance from "./pages/governance";
import { Routes, Route, HashRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { MoralisProvider } from "react-moralis";

//import SurpriseSanta from "surprise-santa";

const APP_ID = process.env.REACT_APP_MORALIS_APP;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER;
const MASTER = process.env.REACT_APP_MORALIS_MASTER;
//snowflakes.start();
ReactDOM.render(
  <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL} masterKey={MASTER}>
    <ChakraProvider>
      {/*  <SurpriseSanta minTime={15} maxTime={25} /> */}
      <HashRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/address/:addr" element={<Address />} />
          <Route path="/topholders" element={<Topholders />} />
          <Route path="/liquiditypools" element={<Liquiditypools />} />
          <Route path="/farmingpools" element={<Farmingpools />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/fees" element={<Fees />} />
        </Routes>
      </HashRouter>
    </ChakraProvider>
  </MoralisProvider>,
  document.getElementById("root")
);
