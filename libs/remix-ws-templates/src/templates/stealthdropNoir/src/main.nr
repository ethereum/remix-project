use dep::std;
use dep::ecrecover;

global DEPTH = 12;

fn main(
  pub_key: [u8; 64],
  signature: [u8; 64],
  hashed_message: pub [u8; 32],
  nullifier: pub Field,
  merkle_path: [Field; DEPTH],
  index: Field,
  merkle_root: pub Field,
  claimer_priv: Field,
  claimer_pub: pub Field
) {
    let key = ecrecover::secp256k1::PubKey::from_unified(pub_key);
    let address = ecrecover::ecrecover(key.pub_x, key.pub_y, signature, hashed_message);

    let signature_as_fields = signature.map(|x : u8| x as Field);
    let calculatedNullifier = std::hash::pedersen(signature_as_fields);
    assert(calculatedNullifier[0] == nullifier);

    let new_root = std::merkle::compute_merkle_root(address, index, merkle_path);
    assert(new_root == merkle_root);
  
    assert(claimer_priv == claimer_pub);
}