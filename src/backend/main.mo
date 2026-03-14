import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Char "mo:core/Char";
import Runtime "mo:core/Runtime";
import Outcall "./http-outcalls/outcall";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Profile = {
    displayName : Text;
    avatarUrl : Text;
    bio : Text;
    isPrivate : Bool;
  };

  type Comment = {
    author : Principal;
    authorName : Text;
    text_ : Text;
    timestamp : Int;
  };

  type Post = {
    id : Nat;
    author : Principal;
    authorName : Text;
    content : Text;
    timestamp : Int;
    likes : [Principal];
    comments : [Comment];
  };

  type Message = {
    id : Nat;
    sender : Principal;
    recipient : Principal;
    body : Text;
    timestamp : Int;
  };

  type PostOption = { style : Text; content : Text };

  type ConversationSummary = {
    otherUser : Principal;
    otherUserName : Text;
    lastMessage : Text;
    lastTimestamp : Int;
  };

  // User profile type for access control integration
  public type UserProfile = Profile;

  let profiles : Map.Map<Principal, Profile> = Map.empty<Principal, Profile>();
  var posts : [Post] = [];
  var messages : [Message] = [];
  var nextPostId = 0;
  var nextMessageId = 0;

  let qChar : Char = Char.fromNat32(34);
  let bsChar : Char = Char.fromNat32(92);
  let nlChar : Char = Char.fromNat32(10);
  let crChar : Char = Char.fromNat32(13);
  let tabChar : Char = Char.fromNat32(9);
  let spChar : Char = Char.fromNat32(32);
  let colonChar : Char = Char.fromNat32(58);
  let lbraceChar : Char = Char.fromNat32(123);
  let rbraceChar : Char = Char.fromNat32(125);
  let lbracketChar : Char = Char.fromNat32(91);
  let rbracketChar : Char = Char.fromNat32(93);
  let nChar : Char = Char.fromNat32(110);

  // Access control integration functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public shared ({ caller }) func setProfile(displayName : Text, avatarUrl : Text, bio : Text, isPrivate : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set profiles");
    };
    profiles.add(caller, { displayName; avatarUrl; bio; isPrivate });
  };

  public query ({ caller }) func getProfile(user : Principal) : async ?Profile {
    let profile = profiles.get(user);
    switch (profile) {
      case (?p) {
        // If profile is private, only the owner or admins can view it
        if (p.isPrivate and caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: This profile is private");
        };
        ?p;
      };
      case null { null };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  func getDisplayName(p : Principal) : Text {
    switch (profiles.get(p)) {
      case (?pr) { pr.displayName };
      case null { "Anonymous" };
    };
  };

  func isProfilePrivate(p : Principal) : Bool {
    switch (profiles.get(p)) {
      case (?pr) { pr.isPrivate };
      case null { false };
    };
  };

  public shared ({ caller }) func createPost(content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    let post : Post = {
      id = nextPostId;
      author = caller;
      authorName = getDisplayName(caller);
      content;
      timestamp = Time.now();
      likes = [];
      comments = [];
    };
    posts := posts.concat([post]);
    nextPostId += 1;
    nextPostId - 1;
  };

  public query ({ caller }) func getPosts(offset : Nat, limit : Nat) : async [Post] {
    let total = posts.size();
    if (offset >= total) return [];
    let reversed = posts.reverse();
    let end_ = Nat.min(offset + limit, total);
    let slice = reversed.sliceToArray(offset, end_);
    // Filter out posts from private profiles unless caller is the author or admin
    slice.filter(func(p : Post) : Bool {
      not isProfilePrivate(p.author) or 
      Principal.equal(p.author, caller) or 
      AccessControl.isAdmin(accessControlState, caller)
    });
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [Post] {
    // Check if profile is private
    if (isProfilePrivate(user) and caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: This profile is private");
    };
    posts.filter(func(p : Post) : Bool { Principal.equal(p.author, user) }).reverse();
  };

  func containsPrincipal(arr : [Principal], p : Principal) : Bool {
    arr.filter(func(x : Principal) : Bool { Principal.equal(x, p) }).size() > 0;
  };

  public shared ({ caller }) func likePost(postId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    var found = false;
    posts := posts.map(func(p : Post) : Post {
      if (p.id == postId) {
        // Check if post author's profile is private
        if (isProfilePrivate(p.author) and caller != p.author and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot interact with private profile posts");
        };
        found := true;
        if (containsPrincipal(p.likes, caller)) {
          { p with likes = p.likes.filter(func(l : Principal) : Bool { not Principal.equal(l, caller) }) };
        } else {
          { p with likes = p.likes.concat([caller]) };
        };
      } else p;
    });
    found;
  };

  public shared ({ caller }) func addComment(postId : Nat, text_ : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };
    var found = false;
    posts := posts.map(func(p : Post) : Post {
      if (p.id == postId) {
        // Check if post author's profile is private
        if (isProfilePrivate(p.author) and caller != p.author and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot interact with private profile posts");
        };
        found := true;
        let c : Comment = { author = caller; authorName = getDisplayName(caller); text_; timestamp = Time.now() };
        { p with comments = p.comments.concat([c]) };
      } else p;
    });
    found;
  };

  public shared ({ caller }) func sendMessage(recipient : Principal, body : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let msg : Message = { id = nextMessageId; sender = caller; recipient; body; timestamp = Time.now() };
    messages := messages.concat([msg]);
    nextMessageId += 1;
    nextMessageId - 1;
  };

  public query ({ caller }) func getMessages(otherUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    messages.filter(func(m : Message) : Bool {
      (Principal.equal(m.sender, caller) and Principal.equal(m.recipient, otherUser)) or
      (Principal.equal(m.sender, otherUser) and Principal.equal(m.recipient, caller));
    });
  };

  public query ({ caller }) func getConversations() : async [ConversationSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    var partners : [Principal] = [];
    for (m in messages.vals()) {
      if (Principal.equal(m.sender, caller)) {
        if (not containsPrincipal(partners, m.recipient)) {
          partners := partners.concat([m.recipient]);
        };
      } else if (Principal.equal(m.recipient, caller)) {
        if (not containsPrincipal(partners, m.sender)) {
          partners := partners.concat([m.sender]);
        };
      };
    };
    partners.map(func(other : Principal) : ConversationSummary {
      let conv = messages.filter(func(m : Message) : Bool {
        (Principal.equal(m.sender, caller) and Principal.equal(m.recipient, other)) or
        (Principal.equal(m.sender, other) and Principal.equal(m.recipient, caller));
      });
      let last = if (conv.size() > 0) conv[conv.size() - 1] else {
        { id = 0; sender = caller; recipient = other; body = ""; timestamp = 0 };
      };
      let otherName = switch (profiles.get(other)) {
        case (?pr) { pr.displayName };
        case null { "Unknown" };
      };
      { otherUser = other; otherUserName = otherName; lastMessage = last.body; lastTimestamp = last.timestamp };
    });
  };

  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  public shared ({ caller }) func generatePostOptions(_rawThought : Text) : async [PostOption] {
    ignore caller;
    Runtime.trap("OpenAI requests must be handled in the frontend.");
  };

  func escapeJson(s : Text) : Text {
    var r = "";
    for (c in s.chars()) {
      if (c == qChar) { r #= "\\\"" }
      else if (c == bsChar) { r #= "\\\\" }
      else if (c == nlChar) { r #= "\\n" }
      else if (c == crChar) { r #= "\\r" }
      else if (c == tabChar) { r #= "\\t" }
      else { r #= c.toText() };
    };
    r;
  };

  func parsePostOptions(json : Text) : [PostOption] {
    let chars = json.chars().toArray();
    let n = chars.size();
    var s : ?Nat = null;
    var e : ?Nat = null;
    var i = 0;
    while (i < n) {
      if (chars[i] == lbracketChar) { s := ?i };
      if (chars[i] == rbracketChar) { e := ?i };
      i += 1;
    };
    switch (s, e) {
      case (?start, ?end_) {
        if (start < end_) { parseOptionsArray(chars, start + 1, end_) }
        else { fallbackOptions() };
      };
      case _ { fallbackOptions() };
    };
  };

  func parseOptionsArray(chars : [Char], start : Nat, end_ : Nat) : [PostOption] {
    var opts : [PostOption] = [];
    var pos = start;
    while (pos < end_ and opts.size() < 3) {
      while (pos < end_ and chars[pos] != lbraceChar) { pos += 1 };
      if (pos >= end_) return if (opts.size() == 0) fallbackOptions() else opts;
      let objStart = pos + 1;
      var depth = 1;
      pos += 1;
      while (pos < end_ and depth > 0) {
        if (chars[pos] == lbraceChar) { depth += 1 }
        else if (chars[pos] == rbraceChar) { depth -= 1 };
        pos += 1;
      };
      let objEnd = pos - 1;
      switch (extractField(chars, objStart, objEnd, "style"), extractField(chars, objStart, objEnd, "content")) {
        case (?st, ?ct) { opts := opts.concat([{ style = st; content = ct }]) };
        case _ {};
      };
    };
    if (opts.size() == 0) fallbackOptions() else opts;
  };

  func extractField(chars : [Char], start : Nat, end_ : Nat, field : Text) : ?Text {
    let fc = field.chars().toArray();
    let fl = fc.size();
    var i = start;
    while (i + fl + 2 < end_) {
      if (chars[i] == qChar) {
        var ok = true;
        var j = 0;
        while (j < fl) {
          if (i + 1 + j >= end_ or chars[i + 1 + j] != fc[j]) { ok := false };
          j += 1;
        };
        if (ok and i + 1 + fl < end_ and chars[i + 1 + fl] == qChar) {
          var k = i + 1 + fl + 1;
          while (k < end_ and chars[k] != colonChar) { k += 1 };
          k += 1;
          while (k < end_ and (chars[k] == spChar or chars[k] == nlChar or chars[k] == tabChar)) { k += 1 };
          if (k < end_ and chars[k] == qChar) {
            k += 1;
            var val = "";
            var esc = false;
            while (k < end_) {
              let ch = chars[k];
              if (esc) {
                if (ch == nChar) { val #= "\n" }
                else if (ch == qChar) { val #= "\"" }
                else if (ch == bsChar) { val #= "\\" }
                else { val #= ch.toText() };
                esc := false;
              } else if (ch == bsChar) {
                esc := true;
              } else if (ch == qChar) {
                return ?val;
              } else {
                val #= ch.toText();
              };
              k += 1;
            };
          };
          return null;
        };
      };
      i += 1;
    };
    null;
  };

  func fallbackOptions() : [PostOption] {
    let a : PostOption = { style = "Short & Punchy"; content = "Vibing and thriving right now! The energy is unmatched. #vibes #authentic #mood #real #livinglife" };
    let b : PostOption = { style = "Story-Driven"; content = "It started with a simple idea and turned into something beautiful. Sometimes the best things come when you least expect them. #journey #growth #story #blessed #grateful" };
    let c : PostOption = { style = "Question-Based"; content = "What is the one thing you wish you had started sooner? Drop it below! #questions #community #growthmindset #realness #letschat" };
    [a, b, c];
  };
};

