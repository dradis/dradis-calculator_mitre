# MITRE addon for Dradis

This simple addon adds a new "MITRE" tab in your Issue view, where you can add MITRE ATT&CK tactics, techniques, and sub-techniques:

![MITRE](https://github.com/user-attachments/assets/04835e13-14d0-4524-9574-ec0768bb38d3)

MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) is a curated knowledge base of real-world cyber adversary behavior, based on threat intelligence and incident reporting. It provides a framework for describing how attackers operate across various stages of an intrusion, helping defenders detect, assess, and mitigate threats effectively. Learn more at [MITRE ATT&CK](https://attack.mitre.org/#)

The add-on requires [Dradis CE](https://dradis.com/ce/) > 3.0, or [Dradis Pro](https://dradis.com/).

## Install

Add this to your `Gemfile.plugins`:

    gem 'dradis-calculator_mitre'

And

    bundle install

Restart your Dradis server and you should be good to go.


## More information

See the Dradis Framework's [README.md](https://github.com/dradis/dradis-ce/blob/develop/README.md)


## Contributing

See the Dradis Framework's [CONTRIBUTING.md](https://github.com/dradis/dradis-ce/blob/develop/CONTRIBUTING.md)


## License

Dradis Framework and all its components are released under [GNU General Public License version 2.0](http://www.gnu.org/licenses/old-licenses/gpl-2.0.html) as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.


## Feature requests and bugs

Please use the [Dradis Framework issue tracker](https://github.com/dradis/dradis-ce/issues) for add-on improvements and bug reports.

## Data Attribution

This plugin uses data from [MITRE ATT&CK®](https://attack.mitre.org/), sourced from the [MITRE CTI repository](https://github.com/mitre/cti).  
© 2015–2024 The MITRE Corporation. This work is licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).
