// Dependencies
var ByteBuffer = require('bytebuffer');
const helperFunctions = require('smoke-machine-js');

// Variables
const OBJECT_HEADER_SIZE = 17; //Type (1) + ObjectNo (4) + InstanceNo (4) + Start (4) + Length (4).
const COMMAND_HEADER_SIZE = 9; //Type (1) + CommandType (4) + InstanceNo (4). 🤷‍♂️

const MESSAGE_TYPE_REQUEST = 1;
const MESSAGE_TYPE_SEND = 2;
const MESSAGE_TYPE_COMMAND = 3;

const SIZEOF_INT = 4;

/**
 * Encodes an object into a Tobject ( a bytebuffer prepended with metadata) to send data to a LaunchLike server.
 * @param {object} { lObject, lInstanceNumber, lStart, cData }
 * @returns {bytebuffer}
 */
const getSendObjectData = ({ lObject, lInstanceNumber, lStart, cData }) => {
  const bb = new ByteBuffer(OBJECT_HEADER_SIZE + cData.length);

  bb.writeByte(MESSAGE_TYPE_SEND);
  bb.writeInt(lObject);
  bb.writeInt(lInstanceNumber);
  bb.writeInt(lStart);
  bb.writeInt(cData.length);
  bb.append(cData);

  return bb.buffer;
};

/**
 * Encodes data required to send a command to a LaunchLike server.
 * @param {object} {lCommand, lInstanceNumber}
 * @returns {bytebuffer}
 */
const getSendCommandData = ({ lCommand, lInstanceNumber }) => {
  const bb = new ByteBuffer(COMMAND_HEADER_SIZE);
  bb.writeByte(MESSAGE_TYPE_COMMAND);
  bb.writeInt(lCommand);
  bb.writeInt(lInstanceNumber);

  return bb.buffer;
};

/**
 * Encodes data required to make an object request to a LaunchLike server.
 * @param {object} {lObject, lInstanceNumber, lStart, lLength}
 * @returns {bytebuffer}
 */
const getRequestObjectData = ({
  lObject,
  lInstanceNumber,
  lStart,
  lLength,
}) => {
  const bb = new ByteBuffer(OBJECT_HEADER_SIZE);
  bb.writeByte(MESSAGE_TYPE_REQUEST);
  bb.writeInt(lObject);
  bb.writeInt(lInstanceNumber);
  bb.writeInt(lStart);
  bb.writeInt(lLength);

  return bb.buffer;
};
/**
 * Requests a command from a LaunchLike server with the given code.
 * @param {object} {lObject, lInstanceNumber}
 * @returns Nothing. This calls a function within the class context provided to it.
 */
const sendCommand = ({ lCommand, lInstanceNumber = 0 }, context) => {
  context.bytesToSend({
    cData: getSendCommandData({
      lCommand,
      lInstanceNumber,
    }),
  });
};

// Experimental
const sendCommandP = ({ lCommand, lInstanceNumber = 0 }, context) => {
  return {
    cData: getSendCommandData({
      lCommand,
      lInstanceNumber,
    }),
  };
};
/**
 * Sends an object from a LaunchLike server with the given code and data.
 * @param {object} {lObject, lInstanceNumber, lStart, cData}
 * @returns Nothing. This calls a function within the class context provided to it.
 */
const sendObject = (
  { lObject, lInstanceNumber = 0, lStart = 0, cData },
  context
) => {
  context.bytesToSend({
    cData: getSendObjectData({
      lObject,
      lInstanceNumber,
      lStart,
      cData,
    }),
  });
};

// Experimental
const sendObjectP = (
  { lObject, lInstanceNumber = 0, lStart = 0, cData },
  context
) => {
  return {
    cData: getSendObjectData({
      lObject,
      lInstanceNumber,
      lStart,
      cData,
    }),
  };
};

/**
 * Requests an object from a LaunchLike server with the given code.
 * @param {object} {cData} - An object containing the request code, the instance number, the starting position, and the length. Generally only the data is provided.
 * @returns Nothing. This calls a function within the class context provided to it.
 */
const requestObject = (
  { lObject, lInstanceNumber = 0, lStart = 0, lLength = 0 },
  context
) => {
  context.bytesToSend({
    cData: getRequestObjectData({
      lObject,
      lInstanceNumber,
      lStart,
      lLength,
    }),
  });
};
// Experimental
const requestObjectP = (
  { lObject, lInstanceNumber = 0, lStart = 0, lLength = 0 },
  context
) => {
  return {
    cData: getRequestObjectData({
      lObject,
      lInstanceNumber,
      lStart,
      lLength,
    }),
  };
};
/**
 * Takes a Tobject and parses out a message type definition and length for the data.
 * The function then calls a handler method of the context which was provided to it with the transcribed data.
 * @param {bytebuffer} cData - The data which you wish to decode
 * @param {class} context - The class context from which you're calling this function.
 * @returns Nothing. This calls a function within the class context provided to it.
 */
const processBytes = async (cData, context) => {
  if (!context) return;
  // What stage of byte processing the function is in.
  var processingState = 'idle';

  var byteBufferInt;
  var byteBufferData;
  var cMessageType;
  var lObjectType;
  var lInstanceNumber;
  var lStart;
  var lLength;

  const discharge = ({ reason }, context) => {
    var lReceivedObjectType = lObjectType;
    var lReceivedInstanceNumber = lInstanceNumber;

    switch (cMessageType) {
      case MESSAGE_TYPE_REQUEST:
        {
          let lReceivedStart = lStart;
          let lReceivedLength = lLength;

          context.ObjectRequested({
            lObject: lReceivedObjectType,
            lInstanceNumber: lReceivedInstanceNumber,
            lOffset: lReceivedStart,
            lLength: lReceivedLength,
          });
        }

        break;
      case MESSAGE_TYPE_SEND: {
        const cData = [...byteBufferData.buffer];
        const lReceivedStart = lStart;

        context.ObjectReceived({
          lObject: lReceivedObjectType,
          lInstanceNumber: lReceivedInstanceNumber,
          lOffset: lReceivedStart,
          cData,
        });
        break;
      }
      case MESSAGE_TYPE_COMMAND:
        {
          context.CommandReceived({
            lCommand: lReceivedObjectType,
            lInstanceNumber,
          });
        }
        break;
      default:
        console.log(
          'Somehow an invalid data type in the discharge. Something is monumentally messed up'
        );
        break;
    }
    processingState = 'idle';
    return;
  };

  cData.forEach((cByte, idx) => {
    if (processingState == 'idle') {
      cMessageType = cByte;
      // Check if cMessageType equals a valid message type
      if (
        cMessageType == MESSAGE_TYPE_REQUEST ||
        cMessageType == MESSAGE_TYPE_SEND ||
        cMessageType == MESSAGE_TYPE_COMMAND
      ) {
        // Change the processing state
        processingState = 'objectNo';
        byteBufferInt = new ByteBuffer(SIZEOF_INT);
        return;
      } else {
        console.log(`Invalid MESSAGE_TYPE`);
        return;
      }
      return;
    }
    if (processingState == 'objectNo') {
      byteBufferInt.writeByte(cByte);
      // Once all slots in the byte buffer are occupied, move to next state
      if (byteBufferInt.offset == byteBufferInt.limit) {
        //  Store object type

        lObjectType = helperFunctions.intFromBytes([...byteBufferInt.buffer]);
        // reset byteBufferInt
        byteBufferInt = new ByteBuffer(SIZEOF_INT);
        processingState = 'instanceNo';
        return;
      }
      return;
    }
    if (processingState == 'instanceNo') {
      byteBufferInt.writeByte(cByte);

      if (byteBufferInt.offset == byteBufferInt.limit) {
        // Store the instance number
        lInstanceNumber = helperFunctions.intFromBytes([
          ...byteBufferInt.buffer,
        ]);
        // Reset byteBufferInt
        byteBufferInt = new ByteBuffer(SIZEOF_INT);
        // Decide what to do depending on message type.
        if (cMessageType == MESSAGE_TYPE_COMMAND) {
          discharge({ reason: 'command' }, context);
          return;
        }
        processingState = 'start';
        return;
      }
      return;
    }
    if (processingState == 'start') {
      byteBufferInt.writeByte(cByte);
      if (byteBufferInt.offset == byteBufferInt.limit) {
        // Store the start position
        lStart = helperFunctions.intFromBytes([...byteBufferInt.buffer]);

        // Reset byteBufferInt
        byteBufferInt = new ByteBuffer(SIZEOF_INT);
        processingState = 'length';
        return;
      }
      return;
    }
    if (processingState == 'length') {
      // 0, 0, 4, 75
      byteBufferInt.writeByte(cByte);

      if (byteBufferInt.offset == byteBufferInt.limit) {
        // Store the length
        lLength = helperFunctions.intFromBytes([...byteBufferInt.buffer]);
        // Reset byteBufferInt
        byteBufferInt = new ByteBuffer(SIZEOF_INT);
        // Allocate length for data or Discharge, if no data payload

        if (cMessageType == MESSAGE_TYPE_REQUEST) {
          discharge({ reason: 'request' }, context);
          return;
        }
        byteBufferData = new ByteBuffer(lLength);
        processingState = 'data';
        return;
      }
      return;
    }
    if (processingState == 'data') {
      byteBufferData.writeByte(cByte);

      // Once chunk of data is fully processed, discharge
      if (byteBufferData.offset == byteBufferData.limit) {
        discharge({ reason: 'data finished' }, context);
        return;
      }
      return;
    }
    return;
  });
};

const processBytesP = async (cData, context) => {
  return new Promise(async (res, rej) => {
    if (!context) return;
    // What stage of byte processing the function is in.
    var processingState = 'idle';

    var byteBufferInt;
    var byteBufferData;
    var cMessageType;
    var lObjectType;
    var lInstanceNumber;
    var lStart;
    var lLength;

    const discharge = ({ reason }, context) => {
      var lReceivedObjectType = lObjectType;
      var lReceivedInstanceNumber = lInstanceNumber;

      switch (cMessageType) {
        case MESSAGE_TYPE_REQUEST:
          {
            let lReceivedStart = lStart;
            let lReceivedLength = lLength;

            res({
              messageType: 'request',
              data: {
                lObject: lReceivedObjectType,
                lInstanceNumber: lReceivedInstanceNumber,
                lOffset: lReceivedStart,
                lLength: lReceivedLength,
              },
            });
          }

          break;
        case MESSAGE_TYPE_SEND: {
          const cData = [...byteBufferData.buffer];
          const lReceivedStart = lStart;

          res({
            messageType: 'object',
            data: {
              lObject: lReceivedObjectType,
              lInstanceNumber: lReceivedInstanceNumber,
              lOffset: lReceivedStart,
              cData,
            },
          });
          break;
        }
        case MESSAGE_TYPE_COMMAND:
          {
            res({
              messageType: 'command',
              data: {
                lCommand: lReceivedObjectType,
                lInstanceNumber,
              },
            });
          }
          break;
        default:
          let e =
            'Somehow an invalid data type in the discharge. Something is monumentally messed up';
          console.log(e);
          rej(e);
          break;
      }
      processingState = 'idle';
      return;
    };

    cData.forEach((cByte, idx) => {
      if (processingState == 'idle') {
        cMessageType = cByte;
        // Check if cMessageType equals a valid message type
        if (
          cMessageType == MESSAGE_TYPE_REQUEST ||
          cMessageType == MESSAGE_TYPE_SEND ||
          cMessageType == MESSAGE_TYPE_COMMAND
        ) {
          // Change the processing state
          processingState = 'objectNo';
          byteBufferInt = new ByteBuffer(SIZEOF_INT);
          return;
        } else {
          console.log(`Invalid MESSAGE_TYPE`);
          return;
        }
        return;
      }
      if (processingState == 'objectNo') {
        byteBufferInt.writeByte(cByte);
        // Once all slots in the byte buffer are occupied, move to next state
        if (byteBufferInt.offset == byteBufferInt.limit) {
          //  Store object type

          lObjectType = helperFunctions.intFromBytes([...byteBufferInt.buffer]);
          // reset byteBufferInt
          byteBufferInt = new ByteBuffer(SIZEOF_INT);
          processingState = 'instanceNo';
          return;
        }
        return;
      }
      if (processingState == 'instanceNo') {
        byteBufferInt.writeByte(cByte);

        if (byteBufferInt.offset == byteBufferInt.limit) {
          // Store the instance number
          lInstanceNumber = helperFunctions.intFromBytes([
            ...byteBufferInt.buffer,
          ]);
          // Reset byteBufferInt
          byteBufferInt = new ByteBuffer(SIZEOF_INT);
          // Decide what to do depending on message type.
          if (cMessageType == MESSAGE_TYPE_COMMAND) {
            discharge({ reason: 'command' }, context);
            return;
          }
          processingState = 'start';
          return;
        }
        return;
      }
      if (processingState == 'start') {
        byteBufferInt.writeByte(cByte);
        if (byteBufferInt.offset == byteBufferInt.limit) {
          // Store the start position
          lStart = helperFunctions.intFromBytes([...byteBufferInt.buffer]);

          // Reset byteBufferInt
          byteBufferInt = new ByteBuffer(SIZEOF_INT);
          processingState = 'length';
          return;
        }
        return;
      }
      if (processingState == 'length') {
        // 0, 0, 4, 75
        byteBufferInt.writeByte(cByte);

        if (byteBufferInt.offset == byteBufferInt.limit) {
          // Store the length
          lLength = helperFunctions.intFromBytes([...byteBufferInt.buffer]);
          // Reset byteBufferInt
          byteBufferInt = new ByteBuffer(SIZEOF_INT);
          // Allocate length for data or Discharge, if no data payload

          if (cMessageType == MESSAGE_TYPE_REQUEST) {
            discharge({ reason: 'request' }, context);
            return;
          }
          byteBufferData = new ByteBuffer(lLength);
          processingState = 'data';
          return;
        }
        return;
      }
      if (processingState == 'data') {
        byteBufferData.writeByte(cByte);

        // Once chunk of data is fully processed, discharge
        if (byteBufferData.offset == byteBufferData.limit) {
          discharge({ reason: 'data finished' }, context);
          return;
        }
        return;
      }
      return;
    });
  });
};

module.exports.smokeSignal = {
  getSendObjectData,
  getSendCommandData,
  getRequestObjectData,
  sendCommand,
  sendObject,
  requestObject,
  processBytes,
};

module.exports.smokeSignalPromise = {};

module.exports.constants = {
  OBJECT_HEADER_SIZE,
  COMMAND_HEADER_SIZE,
  MESSAGE_TYPE_REQUEST,
  MESSAGE_TYPE_SEND,
  MESSAGE_TYPE_COMMAND,
  SIZEOF_INT,
};
