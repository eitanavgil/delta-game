import React, {useRef, useState, useEffect, Fragment} from 'react';
import './App.css';
import * as firebase from 'firebase';

const App = () => {



    const [databaseReady, setDatabaseReady] = useState(false);
    const [snapshot, setSnapshot] = useState();
    const [gameId, setGameId] = useState();
    const [gameCreator, setGameCreator] = useState(false);
    const [userId, setUserId] = useState();
    const [delta, setDelta] = useState();

    const joinInput = useRef(null);
    const playInput = useRef(null);

    const setValueToDb = (valueName: string, value: any, game?: number) => {
        let updates: any = {};
        if (game) {
            updates[`/games/${game}/` + valueName] = value;
        } else {
            updates['/games/' + valueName] = value;
        }
        firebase.database().ref().update(updates);
    };

    const joinGame = (gameId: number) => {
        const ref = firebase.database().ref("join");
    };

    const generateNewGame = () => {
        // create a new game
        const ddd = firebase.database().ref("/games/").push({status:0},(e) => {
            console.log(">>>> ",ddd);
        });
    };

    const getDelta = () => {
        let game;
        if (snapshot && snapshot[gameId]) {
            game = snapshot[gameId]
        }
        const keys = Object.keys(game);
        if (keys.length === 3) {
            const items = keys.filter(item => item.indexOf("u_") === 0);
            if (items.length === 2) {
                const highest = Math.max(game[items[0]], game[items[1]]);
                const lowest = Math.min(game[items[0]], game[items[1]]);
                const delta = highest - lowest;
                setDelta(Math.round(Math.abs(delta / highest) * 100) + "%");
            }
        }
    };
    const removeGame = () => {
        let game;
        if (gameCreator && snapshot && snapshot[gameId]) {
            game = snapshot[gameId];
            const keys = Object.keys(game)
                .filter(item => item.indexOf("u_") === 0)
                .forEach(item => {
                    setValueToDb(item, null, gameId);
                });
        }
    };
    const joinExistingGame = () => {
        if (!joinInput || !joinInput.current || !(joinInput.current as any).value) {
            // missing mandatory params 
            return;
        }
        if (!snapshot[(joinInput.current as any).value]) { // TODO - validate on BE
            // trying to join a non-existing game
            return;
        }
        // Existing game - show play screen 
        setGameId((joinInput.current as any).value)
    };

    const playGame = () => {
        if (!gameId || !playInput || !playInput.current || !userId) {
            return;
        }
        setValueToDb(userId, (playInput.current as any).value, gameId);
    };

    useEffect(() => {
        if (!snapshot || !gameId || !snapshot[gameId]) {
            return;
        }
        const keys = Object.keys(snapshot[gameId]);
        if (keys.length === 3) {
            getDelta();
        }
        ;
    }, [snapshot, gameId]);

    //componentDidMount
    useEffect(() => {
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database().ref().child('games');
        database.on('value', function (snapshotData) {
            if (!databaseReady) {
                setDatabaseReady(true);
            }
            setSnapshot(snapshotData.val());
        });
        setUserId("u_" + Math.floor(1000000 + Math.random() * 900000))
    }, []);

    return (
        <div className="App">
            {
                console.log(`RENDER, GameId:${gameId} dbReady:${databaseReady}`)
            }
            <header className="App-header">
                <h2>What do you want to do?</h2>
                {databaseReady && !gameId &&
                <Fragment>
                    <hr/>
                    <h4>Create a new game</h4>
                    <button className="new-game" onClick={generateNewGame}>New Game</button>
                    <hr/>
                    <h4>Join an existing game</h4>
                    <input ref={joinInput}></input>
                    <button className="join-game" onClick={joinExistingGame}>Join Existing Game</button>
                    <hr/>
                </Fragment>
                }
                {databaseReady && gameId &&
                <Fragment>
                    <h1>{`Game Id: ${gameId}`}</h1>
                    {/*<label htmlFor="name">First name:</label><input ref={user}></input>*/}
                    <label htmlFor="playerVal">Your Number</label><input id="playerVal" ref={playInput}></input>
                    <button className="play-game" onClick={playGame}>Send your Number</button>
                    <button className="get-delta" onClick={getDelta}>Get your delta</button>
                    <button className="remove-game" onClick={removeGame}>Remove Game Data</button>
                </Fragment>
                }
                {delta &&
                <h2 className="delta">{delta}</h2>
                }
                {!databaseReady && "LOADING..."}
            </header>
        </div>
    );
}

export default App;
