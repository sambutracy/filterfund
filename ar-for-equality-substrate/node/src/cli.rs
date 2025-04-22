// filepath: ar-for-equality-substrate/ar-for-equality-substrate/node/src/cli.rs
use clap::{App, Arg, SubCommand};

pub fn cli() {
    let matches = App::new("FilterFund AR Node")
        .version("0.1.0")
        .author("Your Name <youremail@example.com>")
        .about("Substrate node for the FilterFund AR platform")
        .subcommand(
            SubCommand::with_name("run")
                .about("Runs the node")
                .arg(
                    Arg::with_name("dev")
                        .short("d")
                        .long("dev")
                        .help("Run in development mode"),
                )
                .arg(
                    Arg::with_name("chain")
                        .long("chain")
                        .takes_value(true)
                        .help("Specify the chain to run"),
                ),
        )
        .get_matches();

    if let Some(matches) = matches.subcommand_matches("run") {
        if matches.is_present("dev") {
            println!("Running in development mode");
        }

        if let Some(chain) = matches.value_of("chain") {
            println!("Running chain: {}", chain);
        }
    }
}