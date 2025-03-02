pub fn multiplier2(a: Field, b: Field) -> Field {
    a * b
}

fn main(a: Field, b: Field) -> pub Field {
    let c = multiplier2(a, b);

    c
}
