export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const UserProfile = IDL.Record({
    'bio' : IDL.Opt(IDL.Text),
    'created' : IDL.Int,
    'principal' : IDL.Principal,
    'username' : IDL.Text,
    'campaignsCreated' : IDL.Nat,
    'socialLinks' : IDL.Vec(IDL.Text),
    'email' : IDL.Text,
    'avatarUrl' : IDL.Opt(IDL.Text),
    'totalDonations' : IDL.Nat,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Principal, 'err' : IDL.Text });
  return IDL.Service({
    'deleteUser' : IDL.Func([], [Result], []),
    'getAllUsers' : IDL.Func([], [IDL.Vec(UserProfile)], ['query']),
    'getUserCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'getUserProfileByUsername' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'registerUser' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Vec(IDL.Text),
        ],
        [Result_1],
        [],
      ),
    'searchUsers' : IDL.Func([IDL.Text], [IDL.Vec(UserProfile)], ['query']),
    'updateUserProfile' : IDL.Func(
        [
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Vec(IDL.Text)),
        ],
        [Result],
        [],
      ),
    'updateUserStats' : IDL.Func(
        [IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
