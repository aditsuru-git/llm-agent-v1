export default {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["function", "response"],
      description:
        "Type can either be 'function' for executing a function or 'response' for replying to the user.",
    },
    thinking: {
      type: "string",
      description:
        "Internal reasoning process (not visible to the user, only for type: function).",
    },
    response: {
      type: "string",
      description:
        "Response to the user (only applicable when type is 'response').",
    },
    function: {
      type: "string",
      enum: [
        "readDir",
        "renameFile",
        "deleteFile",
        "createFile",
        "createDir",
        "readImages",
        "takeWebScreenshot",
      ],
      description:
        "Function name to execute (only for type: function). This list can be updated in the future.",
    },
    metaData: {
      type: "string",
      description:
        "Comma-separated arguments to pass into the function (only applicable when type is 'function').",
    },
  },
  required: ["type", "thinking"],
};
