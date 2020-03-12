import * as functions from 'firebase-functions';

export const onMessageCreate = functions.database
    .ref('/games/{gameId}')
    .onCreate((snapshot, context) => {
        const ref = snapshot.ref;
        // update pointer to 
        ref.parent?.update({latest:888});
        return ref.update({status: 1});
        // return null;
    });

// export const onMessageUpdate = functions.database
//     .ref('/games/{gameId}')
//     .onUpdate((change, context) => {
//         console.log(">>>> ",change);
//         // const before = change.before.val();
//         // const after = change.after.val();
//         // if(before === after){
//         //     return null;
//         // }
//         // return change.after.ref.update({justAdded: after})
//         return change.after;
//     });
//    

