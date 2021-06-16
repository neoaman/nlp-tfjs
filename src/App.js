import "./App.css";
import * as tf from "@tensorflow/tfjs";

import { useEffect, useState } from "react";
import { Check, Clear, RecordVoiceOver, TextFields } from "@material-ui/icons";
import { Typography, TextField, LinearProgress } from "@material-ui/core";

function App() {
  const [nlpModel, setNlpModel] = useState(null);
  const [wordIndex, setWordIndex] = useState({});
  const [inputstring, setInputstring] = useState(
    "Why don't you enter some text here ?"
  );

  async function loadModel() {
    const model = await tf.loadLayersModel("/static/pureconvModel.json");
    console.log("model loaded");
    setNlpModel(model);
  }

  useEffect(() => {
    loadModel();
    fetch("/static/word_token.json")
      .then((response) => response.json())
      .then((data) => setWordIndex(data));
  }, []);

  const predictIsSarcastic = (text) => {
    const token = text.split(" ");
    const tok = token.map((t) =>
      wordIndex[t.toLowerCase()] !== undefined ? wordIndex[t.toLowerCase()] : 0
    );
    var inputStr = tok.concat(Array(150 - tok.length).fill(0));
    if (nlpModel !== null) {
      const prediction = nlpModel.predict(tf.tensor([inputStr])).dataSync();
      return [prediction >= 0.5 ? 1 : 0, prediction];
    }
    return null;
  };
  return (
    <div className="App">
      <header className="App-header">
        <RecordVoiceOver></RecordVoiceOver>
        <Typography>Detection of Sarcastic Sentence</Typography>
        <TextFields></TextFields>

        <TextField
          value={inputstring ? inputstring : ""}
          onChange={(e) => setInputstring(e.target.value)}
          style={{
            backgroundColor: "white",
            width: "50%",
            padding: 2,
          }}
        ></TextField>

        <br />
        <LinearProgress
          style={{ width: "50%" }}
          variant="determinate"
          value={
            predictIsSarcastic(inputstring)
              ? predictIsSarcastic(inputstring)[1] * 100
              : 0
          }
        />
        {predictIsSarcastic(inputstring) &&
        predictIsSarcastic(inputstring)[0] ? (
          <Check color="secondary"></Check>
        ) : (
          <Clear color="primary"></Clear>
        )}
      </header>
    </div>
  );
}

export default App;
