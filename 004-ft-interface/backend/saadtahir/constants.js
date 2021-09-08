import { standardPrincipalCV } from "@stacks/transactions";

const constants = {
  port: 3000,
  keychain: {
    mnemonic:
      "dinner begin come food group skull bounce need spray axis style identify major remember above extra wasp any bid youth slice erode champion trouble",
    keyInfo: {
      privateKey:
        "8933e590056d0593e64e8db502493d845a388b6a03dfca609cad2be5960c442501",
      address: "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK",
      btcAddress: "mgXmBwiKLTvAExXAxGnujhjwSnk8LBXiJw",
      wif: "L1pR2TZeFonVNVAs6wpgve1NbYSXeMLAyYBiS9CGhztAUgVQ4WFV",
      index: 0,
    },
  },

  wallet_addresses: {
    faried: "ST3T6RJ8DKMJ4XB7DFTER1B9SX91GYBKXT27QC6FM",
    saad_2: "STCZ2WWPY8NX8XNH169S9MSGWHFZJAHWCHEBAVRH",
  },

  functions: {
    contractAddress: "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK",
    contract: {
      name: "app",
      read_only: {
        get_random_number: { name: "get-random-number" },
      },
      public: {
        goal_score: {
          name: "goal-score",
          principal: standardPrincipalCV(
            "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK"
          ),
        },
        is_goal_scored: {
          name: "is-goal-scored",
          score: "225",
          player: standardPrincipalCV(
            "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK"
          ),
        },
      },
    },
    senderAddress: "ST5HYHBZ6CH0DHENSVCRTGKJ0CGTDFN09DRT38YK",
  },
};

export default constants;
