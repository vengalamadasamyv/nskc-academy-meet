// 'use client';
// import { useState } from 'react';
// import {
//   CallControls,
//   CallParticipantsList,
//   CallingState,
//   PaginatedGridLayout,
//   SpeakerLayout,
//   useCallStateHooks,
// } from '@stream-io/video-react-sdk';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Users } from 'lucide-react';

// import Loader from './Loader';
// import EndCallButton from './EndCallButton';
// import { cn } from '@/lib/utils';

// type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

// const MeetingRoom = () => {
//   const searchParams = useSearchParams();
//   const isPersonalRoom = !!searchParams.get('personal');
//   const router = useRouter();
//   const [layout] = useState<CallLayoutType>('speaker-left');
//   const [showParticipants, setShowParticipants] = useState(false);
//   const { useCallCallingState } = useCallStateHooks();

//   // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
//   const callingState = useCallCallingState();

//   if (callingState !== CallingState.JOINED) return <Loader />;

//   const CallLayout = () => {
//     switch (layout) {
//       case 'grid':
//         return <PaginatedGridLayout />;
//       case 'speaker-right':
//         return <SpeakerLayout participantsBarPosition="left" />;
//       default:
//         return <SpeakerLayout participantsBarPosition="right" />;
//     }
//   };

//   return (
//     <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
//       <div className="relative flex size-full items-center justify-center">
//         <div className=" flex size-full max-w-[1000px] items-center flex-row">
//           <CallLayout />
//         </div>
//         <div
//           className={cn('h-[calc(100vh-86px)] hidden ml-2', {
//             'show-block': showParticipants,
//           })}
//         >
//           <CallParticipantsList onClose={() => setShowParticipants(false)} />
//         </div>
//       </div>
//       {/* video layout and call controls */}
//       <div className="fixed bottom-0 flex w-full items-center justify-center gap-2 gap-l-5 mob-call-control flex-col md:flex-row">
//         <CallControls onLeave={() => router.push(`/`)} />
//         <div className="flex items-center gap-2">
//         <button onClick={() => setShowParticipants((prev) => !prev)}>
//           <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
//             <Users size={20} className="text-white" />
//           </div>
//         </button>
//         {!isPersonalRoom && <EndCallButton />}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default MeetingRoom;



// NEW CODE
'use client';
import { useState, useEffect } from 'react';
import {
  CallControls,
  CallParticipantsList,
  PaginatedGridLayout,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';
import { initializeApp } from '@firebase/app';
import { getDatabase, ref, set, onChildAdded } from '@firebase/database';

import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

// Firebase Configuration (Replace with your own Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyBskmcG-VThF3OY8ZKpVgIec-NE6GHoy6I",
  authDomain: "nskc-chat.firebaseapp.com",
  databaseURL: "https://nskc-chat-default-rtdb.firebaseio.com",
  projectId: "nskc-chat",
  storageBucket: "nskc-chat.firebasestorage.app",
  messagingSenderId: "507362536093",
  appId: "1:507362536093:web:f87b0f6eafb9ef69878274"
};

// Initialize Firebase (Firebase 9+)
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isCreator, setIsCreator] = useState(false); // Check if the user is the meeting creator
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  // Assume the creator's ID is set when they start the meeting (or retrieved from context)
  const creatorId = 'creator-user-id'; // Replace with actual logic for identifying creator
  const currentUserId = 'current-user-id'; // Replace with actual logic for current user's ID


  // Fetch messages from Firebase
  const fetchMessages = () => {
    const messagesRef = ref(database, 'messages');
    onChildAdded(messagesRef, (snapshot) => {
      const message = snapshot.val().message;
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  };

  // Send a message to Firebase
  const sendMessage = () => {
    if (newMessage.trim() !== '') {
      const messagesRef = ref(database, 'messages');
      set(messagesRef, {
        message: newMessage,
        timestamp: Date.now(),
      });
      setNewMessage('');
    }
  };

  // Toggle chat visibility
  const toggleChat = () => setShowChat((prev) => !prev);

  // Mute all participants
  const muteAll = () => {
    // Logic to mute all participants
    console.log('Muting all participants');
    // Implement API call to mute all users' microphones
  };

  // Turn off video for all participants
  const turnOffVideoForAll = () => {
    // Logic to turn off video for all participants
    console.log('Turning off video for all participants');
    // Implement API call to turn off video for all users
  };

  // Call layout
  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      fetchMessages();
    }
  }, [callingState]);

  if (callingState !== CallingState.JOINED) return <Loader />;

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center flex-row">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Chat window */}
      {showChat && (
        <div className="fixed bottom-16 left-0 right-0 bg-black bg-opacity-70 p-4 rounded-lg z-10">
          <div className="text-white">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Chat</h2>
            </div>
            <div className="overflow-y-auto max-h-48">
              <div id="chatWindow">
                {messages.map((message, index) => (
                  <div key={index} className="text-white">{message}</div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message"
                className="flex-grow p-2 rounded-lg bg-gray-800 text-white"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white p-2 rounded-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Creator Controls - Only visible to the creator */}
      {isCreator && (
        <div className="absolute top-16 right-16 z-20 flex gap-4">
          <button
            onClick={muteAll}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Mute All
          </button>
          <button
            onClick={turnOffVideoForAll}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Turn Off Video for All
          </button>
        </div>
      )}

      {/* Video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-2 gap-l-5 mob-call-control flex-col md:flex-row">
        <CallControls onLeave={() => router.push(`/`)} />
        <div className="flex items-center gap-2">
          <button onClick={toggleChat}>
            <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <Users size={20} className="text-white" />
            </div>
          </button>
          {!isPersonalRoom && <EndCallButton />}
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;



