//group chat module

const { Timekoto } = require("timekoto");
const GroupChatMessage = require("../models/Chat/GroupChatModel");
const Group = require("../models/Group/GroupModel");
const { logger } = require("../services/logHandlers/HandleWinston");

async function handleGroupMessage(io, data) {
  try {
    const { senderId, senderImage, groupId, message, attachment } = data;
    const processedData = {
      sender: senderId,
      senderImage: senderImage,
      group: groupId,
      message: message,
      attachment: attachment,
    };

    //get users list from the group
    const groupUsers = await Group.findById(groupId);
    if (!groupUsers) {
      throw new CustomError(404, "Group not found");
    }
    if (!groupUsers?.members) {
      throw new CustomError(404, "Group members not found");
    }
    groupUsers?.members?.forEach((id) => {
      io.to(id.toString()).emit("group", {
        ...processedData,
        createdAt: Timekoto(),
      });
    });

    //save the message to the database
    const newMessage = await GroupChatMessage.addGroupChatMessage(
      processedData
    );

    //log the message
    logger.log({
      level: "debug",
      message: `GROUP: Message sent from "${senderId}" to the group"${groupId}": \n messge: "${message}" \n attachment: "${attachment}"`,
    });

    // io.to(groupId).emit("group", newMessage);
  } catch (error) {
    console.error("Error saving group chat message:", error);
  }
}

// async function handleCreateGroup(data ) {
//   try {
//     const { groupName, userIds } = data;
//     const newGroup = await GroupChat.create({
//       name: groupName,
//       users: userIds,
//     });

//     userIds.forEach((id) => socket.join(newGroup._id.toString()));
//     io.to(newGroup._id.toString()).emit("groupCreated", newGroup);
//   } catch (error) {
//     console.error("Error creating group:", error);
//   }
// }

// async function handleAddUsersToGroup(data) {
//   try {
//     const { groupId, userIds } = data;
//     await createGroupIfNotExists(groupId, userIds);

//     //get users list from the group
//     const group = await GroupChat.findById(groupId);
//     group.users.forEach((id) => {
//       io.to(id.toString()).emit("usersAddedToGroup", userIds);
//     });
//   } catch (error) {
//     console.error("Error adding users to group:", error);
//   }
// }

// async function createGroupIfNotExists(groupId, userIds) {
//   const group = await GroupChat.findById(groupId);
//   if (!group) {
//     await GroupChat.create({
//       _id: groupId,
//       users: userIds,
//     });
//   } else {
//     group.users = [...new Set([...group.users, ...userIds])];
//     await group.save();
//   }
// }

//call module
// async function handleIndividualCall(io, socket, { callerId, receiverId }) {
//   try {
//     // Emit an "incomingCall" event to the receiver with the callerId included
//     io.to(receiverId).emit("incomingCall", { callerId });

//     // Listen for the receiver's response to the call
//     socket.on("callResponse", async (response) => {
//       try {
//         if (response.accepted) {
//           // If the call is accepted, emit a "callAccepted" event to both caller and receiver
//           io.to(callerId).emit("callAccepted", { receiverId });
//           io.to(receiverId).emit("callAccepted", { callerId });

//           // Here you can implement further logic for establishing the call connection,
//           // such as setting up WebRTC peer connections, starting media streams, etc.

//           // Create RTCPeerConnection object
//           const pc = new RTCPeerConnection();

//           // Add local stream to peer connection
//           navigator.mediaDevices
//             .getUserMedia({ audio: true, video: true })
//             .then((stream) => {
//               stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//             })
//             .catch((error) => {
//               console.error("Error accessing media devices:", error);
//             });

//           // Listen for ICE candidates and send them to the remote peer
//           pc.onicecandidate = (event) => {
//             if (event.candidate) {
//               socket.emit("icecandidate", {
//                 candidate: event.candidate,
//                 receiverId,
//               });
//             }
//           };

//           // Create offer and set local description
//           const offer = await pc.createOffer();
//           await pc.setLocalDescription(offer);

//           // Send offer to the remote peer
//           socket.emit("offer", { offer, receiverId });

//           // Listen for answer from the remote peer
//           socket.on("answer", async ({ answer }) => {
//             await pc.setRemoteDescription(new RTCSessionDescription(answer));
//           });
//         } else {
//           // If the call is rejected, emit a "callRejected" event to the caller
//           io.to(callerId).emit("callRejected", { receiverId });
//         }
//       } catch (error) {
//         console.error("Error handling call response:", error);
//       }
//     });
//   } catch (error) {
//     console.error("Error handling individual call:", error);
//   }
// }

module.exports = {
  handleGroupMessage,
  //   handleIndividualMessage,
  //   handleCreateGroup,
  //   handleAddUsersToGroup,
  //   handleIndividualCall,
};
