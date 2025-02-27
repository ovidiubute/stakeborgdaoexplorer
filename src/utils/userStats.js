import standard_token_abi from "./../abi/standard_token.json";
import governance_staking_abi from "./../abi/governance_staking.json";
import governance_rewards_abi from "./../abi/governance_rewards.json";
import yieldfarmtoken_bond_abi from "./../abi/yieldfarmtoken_bond.json";
import yieldfarmtoken_swingby_abi from "./../abi/yieldfarmtoken_swingby.json";
import yieldfarmtoken_xyz_abi from "./../abi/yieldfarmtoken_xyz.json";
import yieldfarmtoken_usdc_lp_abi from "./../abi/yieldfarmtoken_usdc_lp.json";
import yieldstaking_abi from "./../abi/yieldstaking.json";
import Web3 from "web3";

const Moralis = require("moralis");

const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.REACT_APP_AWS_NODE)
);

const standard_contract_address = "0xda0c94c73d127ee191955fb46bacd7ff999b2bcd";

const BOND_contract_address = "0x0391D2021f89DC339F60Fff84546EA23E337750f";
const SWINGBY_contract_address = "0x8287c7b963b405b7b8d467db9d79eec40625b13a";
const XYZ_contract_address = "0x618679df9efcd19694bb1daa8d00718eacfa2883";
const USDC_SLP_contract_address = "0xf1e34d19f63b69eaa70952f2f64f735849959833";

const governance_staking_dao_contract_adress =
  "0xbA319F6F6AC8F45E556918A0C9ECDDE64335265C";
const governance_rewards_contract_address =
  "0x1fC8EfDb15FD5f9250077dD820C201B36bBc1f0B";

const yield_staking_contract_address =
  "0x7f4fe6776a9617847485d43db0d3a9b734e459c5";

const yield_farm_bond_contract_address =
  "0x2b31D07A2625a2fBAe68feed5a818ffc00dFB21b";

const yield_farm_swingby_contract_address =
  "0xab0a722e5e8e6ea4299fe0cbed7f62c2a904267a";

const yield_farm_xyz_contract_address =
  "0x2b89b42a95676dc74013ece6c07a760df5709c5c";

const yield_farm_usdc_lp_contract_address =
  "0x41099b337F8435579dea46C7840b730ca87Fd35A";

let standard_contract;
let governance_staking_contract;
let governance_rewards_contract;
let yield_staking_contract;
let yield_unclaimed_bond_contract;
let yield_unclaimed_swingby_contract;
let yield_unclaimed_xyz_contract;
let yield_unclaimed_usdc_lp_contract;

async function init() {
  standard_contract = new web3.eth.Contract(
    standard_token_abi,
    standard_contract_address
  );
  governance_staking_contract = new web3.eth.Contract(
    governance_staking_abi,
    governance_staking_dao_contract_adress
  );
  governance_rewards_contract = new web3.eth.Contract(
    governance_rewards_abi,
    governance_rewards_contract_address
  );
  yield_staking_contract = new web3.eth.Contract(
    yieldstaking_abi,
    yield_staking_contract_address
  );
  yield_unclaimed_bond_contract = new web3.eth.Contract(
    yieldfarmtoken_bond_abi,
    yield_farm_bond_contract_address
  );
  yield_unclaimed_swingby_contract = new web3.eth.Contract(
    yieldfarmtoken_swingby_abi,
    yield_farm_swingby_contract_address
  );
  yield_unclaimed_xyz_contract = new web3.eth.Contract(
    yieldfarmtoken_xyz_abi,
    yield_farm_xyz_contract_address
  );
  yield_unclaimed_usdc_lp_contract = new web3.eth.Contract(
    yieldfarmtoken_usdc_lp_abi,
    yield_farm_usdc_lp_contract_address
  );
}

export async function getWalletTokens(addr) {
  if (!web3.utils.isAddress(addr)) return 0;
  let wallet = 0;
  wallet = await standard_contract.methods.balanceOf(addr).call();
  return wallet;
}

export async function getGovernanceStakedTokens(addr) {
  if (!web3.utils.isAddress(addr)) return 0;
  let govstake = 0;
  govstake = await governance_staking_contract.methods.balanceOf(addr).call();
  return govstake;
}

export async function getGovernanceUnclaimedTokens(addr) {
  if (!web3.utils.isAddress(addr)) return 0;
  let pendingRewardsGov = 0;
  const batch = new web3.BatchRequest();

  let promise1 = new Promise((resolve, rej) => {
    batch.add(
      governance_rewards_contract.methods
        .userMultiplier(addr)
        .call.request(null, (err, res) => {
          resolve(res);
        })
    );
  });

  let promise2 = new Promise((resolve, rej) => {
    batch.add(
      governance_rewards_contract.methods
        .currentMultiplier()
        .call.request(null, (err, res) => {
          resolve(res);
        })
    );
  });

  let promise3 = new Promise((resolve, rej) => {
    batch.add(
      governance_staking_contract.methods
        .balanceOf(addr)
        .call.request(null, (err, res) => {
          resolve(res);
        })
    );
  });

  batch.execute();

  return Promise.all([promise1, promise2, promise3]).then((res) => {
    const [userMultiplierGov, currentMultiplierGov, balance] = res;
    let multiplier = currentMultiplierGov - userMultiplierGov;

    pendingRewardsGov = balance * multiplier;

    return pendingRewardsGov;
  });
}
export async function getFarmingUnclaimedTokensForYieldFarm(
  addr,
  currentEpoch,
  yieldContract,
  tokenContract,
  db
) {
  if (!web3.utils.isAddress(addr)) return 0;
  let pending_farm = 0;

  let numberOfEpochs = await yieldContract.methods.numberOfEpochs.call().call();

  let totalDistributedAmount =
    await yieldContract.methods.totalDistributedAmount.call().call();

  const batch = new web3.BatchRequest();
  let promises = [];
  for (let epoch = 1; epoch <= currentEpoch; epoch++) {
    promises.push(
      // eslint-disable-next-line no-loop-func
      new Promise((resolve, rej) => {
        batch.add(
          yield_staking_contract.methods
            .getEpochUserBalance(addr, tokenContract, epoch)
            .call.request(null, (err, res) => {
              resolve(res);
            })
        );
      })
    );
  }
  for (let epoch = 1; epoch <= currentEpoch; epoch++) {
    promises.push(
      // eslint-disable-next-line no-loop-func
      new Promise((resolve, rej) => {
        batch.add(
          yield_staking_contract.methods
            .getEpochPoolSize(tokenContract, epoch)
            .call.request(null, (err, res) => {
              resolve(res);
            })
        );
      })
    );
  }

  batch.execute();

  await Promise.all(promises).then((res) => {
    const firstBatch = res.slice(0, currentEpoch);
    const secondBatch = res.slice(currentEpoch);

    for (let i = 0; i < currentEpoch; i++) {
      if (secondBatch[i] != 0) {
        pending_farm +=
          ((totalDistributedAmount / numberOfEpochs) * firstBatch[i]) /
          secondBatch[i];
      }
    }
  });

  const harvested = Moralis.Object.extend(db);
  const query = new Moralis.Query(harvested);
  query.equalTo("user", addr.toLowerCase());
  await query.find().then(function (events) {
    if (events.length) {
      events.forEach((event) => {
        pending_farm -= event.attributes.totalValue;
      });
    }
  });

  if (pending_farm < 0) pending_farm = 0;

  return pending_farm;
}

export async function getFarmingUnclaimedTokens(addr) {
  if (!web3.utils.isAddress(addr)) return 0;
  let total_pending_farm = 0;

  let currentEpoch = await await yield_staking_contract.methods
    .getCurrentEpoch()
    .call();

  total_pending_farm += await getFarmingUnclaimedTokensForYieldFarm(
    addr,
    currentEpoch,
    yield_unclaimed_bond_contract,
    BOND_contract_address,
    "YieldFarmBONDHarvest"
  );
  total_pending_farm += await getFarmingUnclaimedTokensForYieldFarm(
    addr,
    currentEpoch,
    yield_unclaimed_swingby_contract,
    SWINGBY_contract_address,
    "YieldFarmSWINGBYHarvest"
  );
  total_pending_farm += await getFarmingUnclaimedTokensForYieldFarm(
    addr,
    currentEpoch,
    yield_unclaimed_xyz_contract,
    XYZ_contract_address,
    "YieldFarmXYZHarvest"
  );

  total_pending_farm += await getFarmingUnclaimedTokensForYieldFarm(
    addr,
    currentEpoch,
    yield_unclaimed_usdc_lp_contract,
    USDC_SLP_contract_address,
    "YieldFarmSLPUSDCHarvest"
  );

  return total_pending_farm;
}

export async function getAirdopUnclaimedTokens(addr) {
  return null;
}

export async function getUserTokens(addr) {
  await init();
  let _addr = addr;
  let _wallet = Number((await getWalletTokens(addr)) / 1000000000000000000);
  let _governanceStaking = Number(
    (await getGovernanceStakedTokens(addr)) / 1000000000000000000
  );
  let _governanceUnclaimed = Number(
    (await getGovernanceUnclaimedTokens(addr)) /
      1000000000000000000000000000000000000
  );
  let _farmingUnclaimed = Number(
    (await getFarmingUnclaimedTokens(addr)) / 1000000000000000000
  );
  let _airdropUnclaimed = Number(
    (await getAirdopUnclaimedTokens(addr)) / 1000000000000000000
  );

  let user = {
    address: _addr,
    wallet: _wallet.toFixed(2),
    governanceStaking: _governanceStaking.toFixed(2),
    governanceUnclaimed: _governanceUnclaimed.toFixed(2),
    farmingUnclaimed: _farmingUnclaimed.toFixed(2),
    airdropUnclaimed: _airdropUnclaimed.toFixed(2),
    total: (
      _wallet +
      _governanceStaking +
      _governanceUnclaimed +
      _farmingUnclaimed +
      _airdropUnclaimed
    ).toFixed(2),
  };
  return user;
}

export async function getAllHolders(setEntriesTotal, setRequestsTotal) {
  let allUsers = [];

  let dataOrigins = [
    "YieldFarmBONDHarvest",
    "YieldFarmSWINGBYHarvest",
    "YieldFarmXYZHarvest",
    "STANDARDTokenApproval",
    "GovernanceStakingDeposit",
    "YieldFarmStakingDeposit",
    "YieldFarmSLPUSDCHarvest",
  ];

  let dataOriginColumn = [
    "user",
    "user",
    "user",
    "spender",
    "user",
    "user",
    "user",
  ];

  let data, query, count, cnt;

  for (let i = 0; i < dataOrigins.length; i++) {
    data = Moralis.Object.extend(dataOrigins[i]);
    query = new Moralis.Query(data);
    count = await query.count();

    cnt = 0;
    while (cnt < count) {
      await query
        .skip(cnt)
        .find()
        .then(function (events) {
          if (events.length) {
            events.forEach((event) => {
              if (
                allUsers.indexOf(event.attributes[dataOriginColumn[i]]) === -1
              ) {
                allUsers.push(event.attributes[dataOriginColumn[i]]);
              }
            });
          }
        });
      setEntriesTotal(allUsers.length);
      setRequestsTotal(allUsers.length);
      cnt += 100;
    }
  }
  return allUsers;
}

export async function getAllHoldersData(
  setEntriesLoaded,
  setEntriesTotal,
  setRequestsLoaded,
  setRequestsTotal
) {
  await init();
  let data = [];
  let holders = await getAllHolders(setEntriesTotal, setRequestsTotal);

  holders = holders.filter(function (item) {
    //this is a smart contract which we don't care about
    return item !== "0xba319f6f6ac8f45e556918a0c9ecdde64335265c";
  });
  setEntriesTotal(holders.length);
  setRequestsTotal(holders.length);

  let currentIndexLoaded = 0;
  let currentIndexRequested = 0;
  await Promise.all(
    holders.map(async (holder) => {
      setRequestsLoaded(currentIndexRequested);
      currentIndexRequested++;
      let holderData = await getUserTokens(holder);
      data.push({
        address: holder,
        wallet: holderData.wallet,
        governanceStaking: holderData.governanceStaking,
        governanceUnclaimed: holderData.governanceUnclaimed,
        farmingUnclaimed: holderData.farmingUnclaimed,
        airdropUnclaimed: holderData.airdropUnclaimed,
        total: holderData.total,
      });

      setEntriesLoaded(currentIndexLoaded);
      currentIndexLoaded++;
    })
  );
  return data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class PendingPromise {
  constructor(args) {
    this.args = args;
  }

  execute() {
    return new Promise(this.args);
  }
}
