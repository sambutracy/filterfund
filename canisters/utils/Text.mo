// canisters/utils/Text.mo - Patched version of Text module
import Char "mo:base/Char";
import Iter "mo:base/Iter";
import Prim "mo:prim";

module {
  /// Returns the character at the given index of `t`.
  public func charAt(t : Text, i : Nat) : Char {
    let cs = t.chars();
    var j = 0;
    while (j < i) {
      switch (cs.next()) {
        case null { Prim.trap("Text.charAt: index out of bounds"); };
        case (? _) { j += 1; };
      };
    };
    switch (cs.next()) {
      case null { Prim.trap("Text.charAt: index out of bounds"); };
      case (? c) { c };
    };
  };

  /// Concatenate the given texts.
  public func concat(ts : [Text]) : Text {
    var t = "";
    for (i in ts.vals()) {
      t := t # i;
    };
    t;
  };

  /// Returns true if `t` contains `p` as a substring.
  public func contains(t : Text, p : Text) : Bool {
    switch (Prim.textCompare(p, "")) {
      case (#equal) { return true; };
      case _ {};
    };
    let tsize = t.size();
    let psize = p.size();
    if (psize > tsize) { return false; };
    let n = tsize - psize + 1;
    for (i in Iter.range(0, n - 1)) {
      if (Prim.textCompare(t.subText(i, psize), p) == #equal) {
        return true;
      };
    };
    false;
  };

  /// Convert the given text to lowercase.
  public func toLower(t : Text) : Text {
    let cs = t.chars();
    var res = "";
    for (c in cs) {
      res := res # Char.toText(Char.toLower(c));
    };
    res;
  };

  /// Convert the given text to uppercase.
  public func toUpper(t : Text) : Text {
    let cs = t.chars();
    var res = "";
    for (c in cs) {
      res := res # Char.toText(Char.toUpper(c));
    };
    res;
  };

  /// Returns the size of `t` in characters.
  public func size(t : Text) : Nat {
    t.size();
  };

  /// Returns `t` as an array of characters.
  public func toArray(t : Text) : [Char] {
    Iter.toArray(t.chars());
  };

  // Add any other Text functions you need here
}