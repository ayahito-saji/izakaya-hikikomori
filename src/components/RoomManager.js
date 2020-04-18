var RoomManager = (function() {
    var roomId = "";

    var getRoomId = function() {
        return roomId;    // Or pull this from cookie/localStorage
    };

    var setRoomId = function(name) {
        roomId = name;
        // Also set this in cookie/localStorage
    };

    return {
        getRoomId: getRoomId,
        setRoomId: setRoomId,
    }

})();

export default RoomManager;
