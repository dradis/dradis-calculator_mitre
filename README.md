# MITRE addon for Dradis

This simple addon adds a new "MITRE" tab in your Issue view, where you can add MITRE ATT&CK tactics, techniques, and sub-techniques:

![mitre-ce](https://github.com/user-attachments/assets/6cc8573e-4fa9-4660-a487-7f4fba58f54c)

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
