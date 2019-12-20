import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CONTACT_EMAIL_HREF, ORG } from '../constants';
import { unprefix } from '../utils/jsonld';
import Org from './org';

export default function CodeOfConduct() {
  return (
    <article>
      <Helmet>
        <title>{ORG} • Code of Conduct</title>
      </Helmet>
      <h1 id="code-of-conduct">Code of Conduct</h1>
      <p>
        This Code of Conduct presents a summary of the shared values of the
        community we want to support and foster at <Org />. The basic social
        ingredients that hold our project together include:
      </p>
      <ul>
        <li>Be constructive;</li>
        <li>Be respectful;</li>
        <li>Be supportive.</li>
      </ul>
      <section>
        <h2 id="our-pledge">Our Pledge</h2>
        <p>
          <Org /> provides a space for any researcher to give rapid feedback to
          outbreak-related preprints. In the interest of fostering an open and
          welcoming environment we, as contributors and maintainers, pledge to
          making participation in our project and our community a
          harassment-free experience for everyone, regardless of age, body size,
          disability, ethnicity, gender identity and expression, level of
          experience, nationality, personal appearance, race, religion, or
          sexual identity and orientation. We believe it is our duty as
          scientists at any level of our career to contribute to scientific
          evaluation in the form of peer review.
        </p>
      </section>

      <section>
        <h2 id="our-responsibilities">Our Responsibilities</h2>
        <p>
          The <Org /> team is responsible for clarifying the standards of
          acceptable behavior and is expected to take appropriate and fair
          corrective action in response to any instances of unacceptable
          behavior.
        </p>
        <p>
          The <Org /> team has the right and responsibility to remove
          contributions that are not aligned to this Code of Conduct, or to
          temporarily or permanently ban any contributor for other behaviors
          that they deem inappropriate, threatening, offensive, or harmful.
        </p>
      </section>

      <section>
        <h2 id="who-does-this-code-of-conduct-apply-to">
          Who does this Code of Conduct apply to?
        </h2>
        <p>
          This Code of Conduct applies to <Org /> members contributing directly
          on this platform or members/non-members participating in events
          organized by <Org /> (workshop, live-streamed preprint journal clubs,
          community calls, etc.).
        </p>

        <h2 id="reporting-code-of-conduct-violations">
          Reporting Code of Conduct violations
        </h2>
        <p>
          Instances of <Org /> Code of Conduct violations may be reported by any
          community member by:
        </p>
        <ul>
          <li>
            Flagging a problematic rapid review and briefly explaining the
            reason for reporting the misconduct. This can be done by any
            platform user with an active account by clicking on the problematic
            rapid review author’s avatar and selecting “Report Review”;
          </li>
          <li>
            Filling out this anonymous{' '}
            <a href="https://forms.gle/x6kvbgGZyRZVALPa8">
              {' '}
              Code of Conduct violation form.
            </a>
          </li>
          <li>
            Contacting us directly at{' '}
            <strong>
              <a href={CONTACT_EMAIL_HREF}>{unprefix(CONTACT_EMAIL_HREF)}</a>
            </strong>
            .
          </li>
        </ul>

        <p>
          All complaints will be reviewed and investigated, and will result in a
          response that is deemed necessary and appropriate to the
          circumstances. The <Org /> team is obligated to maintain
          confidentiality with regard to the person that reports an incident.
          Further details of specific enforcement policies may be posted
          separately. <Org /> members who do not follow and <Org /> team members
          who do not enforce the Code of Conduct in good faith may face
          temporary or permanent repercussions as determined by other members of
          the project’s leadership.
        </p>

        <p>
          <strong>
            Example behaviors that contribute to creating a positive environment
            include:
          </strong>
        </p>

        <ul>
          <li>Using welcoming and inclusive language;</li>
          <li>
            Providing feedback that is constructive, <em>i.e.</em>, useful to
            the receiver (see more below);
          </li>
          <li>Being respectful of differing viewpoints and experiences;</li>
          <li>Gracefully accepting constructive criticism;</li>
          <li>Focusing on what is best for the community;</li>
          <li>Showing empathy towards other community members.</li>
        </ul>

        <p>
          <strong>
            Examples of unacceptable behaviors by participants include:
          </strong>
        </p>

        <ul>
          <li>
            Trolling, insulting/derogatory comments, and personal or political
            attacks;
          </li>
          <li>
            Providing unconstructive or disruptive feedback on <Org />;
          </li>
          <li>Public or private harassment;</li>
          <li>
            Publishing others’ private information, such as a physical or
            electronic address, without explicit permission;
          </li>
          <li>
            The use of sexualized language or imagery and unwelcome sexual
            attention or advances;
          </li>
          <li>
            Other conduct which could reasonably be considered inappropriate in
            a professional setting.
          </li>
        </ul>
      </section>

      <section>
        <h2 id="competing-interest">Competing Interest</h2>
        <p>
          At <Org /> we ask all contributors to disclose any competing interest
          <abbr title="Competing Interest">CI</abbr>) that may exist between a
          rapid review author (or affiliated organization) and the author(s) (or
          affliated organization) of the reviewed preprint.
        </p>
        <p>
          In the context of this platform, a competing interest is anything that
          interferes with, or could reasonably be perceived as interfering with,
          the objective of a rapid review of a preprint on <Org />.
        </p>
        <p>
          <strong>
            Examples of competing interests that would be considered a violation
            of this Code of Conduct if not disclosed include, but are not
            limited to:
          </strong>
        </p>
        <ul>
          <li>
            The author of the rapid review is an author of the reviewed
            preprint;
          </li>
          <li>
            The author of the rapid review has a personal relationship with the
            author(s) of the reviewed preprint;
          </li>
          <li>
            The author of the rapid review is a rival or competitor of the
            author(s) of the reviewed preprint;
          </li>
          <li>
            The author of the rapid review has recently worked in the same
            institution or organization as the author(s) of the reviewed
            preprint;
          </li>
          <li>
            The author of the rapid review is a collaborator of the author(s) of
            the reviewed preprint;
          </li>
          <li>
            The author of the rapid review has published with the author(s) of
            the reviewed preprint during the last 5 years;
          </li>
          <li>
            The author of the rapid review holds a grant with the author(s) of
            the reviewed preprint.
          </li>
        </ul>

        <p>
          Competing interests matter because they can introduce perceived or
          actual bias in the evaluation of the preprint that can have
          repercussions all the way to the journal acceptance of that
          manuscript.
        </p>
        <p>
          <strong>
            If you think that you have a potential competing interest with the
            authors, or the organization to which the author(s) is affiliated,
            please do disclose it in your review. A failure to disclose a
            competing interest is considered a violation of this Code of Conduct
            and will be treated accordingly.
          </strong>
        </p>
        <p>
          To read more about competing interests in peer review, please refer to
          the{' '}
          <a href="http://reviewers.plos.org/resources/competing-interests-for-reviewers/">
            PLoS Reviewer Center’s resources
          </a>
          . They provide a very useful checklist for you to self-evaluate your
          possible competing interest in relation to a manuscript you wish to
          review or comment.
        </p>
      </section>

      <footer>
        <p>
          The content of this page was adapted from the{' '}
          <a href="https://www.contributor-covenant.org/version/1/4/code-of-conduct.html">
            Contributor Covenant, version 1.4
          </a>{' '}
          and from{' '}
          <a href="http://reviewers.plos.org/">PLoS Peer Reviewer Center</a>. If
          you have questions, feedback (please constructive only!), or
          suggestions on how to improve it, please contact us at{' '}
          <a href={CONTACT_EMAIL_HREF}>{unprefix(CONTACT_EMAIL_HREF)}</a>.
        </p>

        <p>Thank you for being a good community member!</p>
      </footer>
    </article>
  );
}
