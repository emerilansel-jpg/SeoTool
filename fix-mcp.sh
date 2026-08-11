sed -i '38,47c\
        JSON.stringify({\
          serverId: serverMocks.serverIds.get(_server),\
          options,\
        }),\
        {\
          status: 200,\
          headers: { "Content-Type": "application/json" },\
        },\
      );\
  },\
}));\
' src/server/mcp/transport.test.ts
