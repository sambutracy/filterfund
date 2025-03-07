// canisters/utils/TextUtil.mo
import Char "mo:base/Char";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

module {
  // Simple implementations of lowercase and uppercase functions
  // These replace the problematic Text.toLowercase() and Text.toUppercase()
  
  public func toLower(text: Text) : Text {
    let chars = text.chars();
    var result = "";
    
    for (c in chars) {
      result := result # Char.toText(Char.toLower(c));
    };
    
    result
  };
  
  public func toUpper(text: Text) : Text {
    let chars = text.chars();
    var result = "";
    
    for (c in chars) {
      result := result # Char.toText(Char.toUpper(c));
    };
    
    result
  };
  
  // Helper function to check if text is empty
  public func isEmpty(text: Text) : Bool {
    text.size() == 0
  };
  
  // Helper function to check if text contains a substring
  public func contains(text: Text, substring: Text) : Bool {
    // Simple implementation
    switch (Text.indexOf(substring, text)) {
      case null false;
      case _ true;
    }
  };
}
