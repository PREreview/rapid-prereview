import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CONTACT_EMAIL_HREF } from '../constants';
import { unprefix } from '../utils/jsonld';

export default function CodeOfConduct() {
  return (
    <article>
      <Helmet>
        <title>Rapid PREreview • Code of Conduct</title>
      </Helmet>
      <h1 id="code-of-conduct">Code of Conduct</h1>
      <section>
        <h2 id="our-pledge">Our Pledge</h2>
        <p>
          In the interest of fostering an open and welcoming environment we, as
          contributors and maintainers, pledge to making participation in our
          project and our community a harassment-free experience for everyone,
          regardless of age, body size, disability, ethnicity, gender identity
          and expression, level of experience, nationality, personal appearance,
          race, religion, or sexual identity and orientation. We believe it is
          our duty as scientists at any level of our career to contribute to
          scientific evaluation in the form of peer review. <Org /> provides a
          space for any researcher, independently of their career level, to
          provide feedback to emerging scientific output. We strive to build and
          support a community of PREreviewers who provide constructive feedback,
          because we are convinced that one can be honest AND respectful at the
          same time.{' '}
        </p>
      </section>

      <section>
        <h2 id="our-responsibilities">Our Responsibilities</h2>
        <p>
          The <Org /> team is responsible for clarifying the standards of
          acceptable behavior and is expected to take appropriate and fair
          corrective action in response to any instances of unacceptable
          behavior.{' '}
        </p>
        <p>
          The <Org /> team has the right and responsibility to remove, edit, or
          reject comments, and other contributions that are not aligned to this
          Code of Conduct, or to temporarily or permanently ban any contributor
          for other behaviors that they deem inappropriate, threatening,
          offensive, or harmful.{' '}
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
          Instances of abusive, harassing, or otherwise unacceptable behavior
          may be reported personally by contacting the <Org /> leadership team
          at{' '}
          <strong>
            <a href={CONTACT_EMAIL_HREF}>{unprefix(CONTACT_EMAIL_HREF)}</a>
          </strong>
          .
        </p>

        <p>
          An example of unacceptable behavior includes, but is not limited to, a
          rude and/or destructive comment appearing in a <Org /> (see below for
          more examples of unacceptable behavior). All complaints will be
          reviewed and investigated, and will result in a response that is
          deemed necessary and appropriate to the circumstances. The <Org />
          team is obligated to maintain confidentiality with regard to the
          person that reports an incident. Further details of specific
          enforcement policies may be posted separately. <Org /> members who do
          not follow and <Org /> team members who do not enforce the Code of
          Conduct in good faith may face temporary or permanent repercussions as
          determined by other members of the project’s leadership.
        </p>

        <p>
          <strong>
            Example behaviors that contribute to creating a positive environment
            include:
          </strong>
        </p>

        <ul>
          <li>Using welcoming and inclusive language</li>
          <li>
            Providing feedback that is constructive, <em>i.e.</em>, useful to
            the receiver (see more below)
          </li>
          <li>Being respectful of differing viewpoints and experiences</li>
          <li>Gracefully accepting constructive criticism</li>
          <li>Focusing on what is best for the community</li>
          <li>Showing empathy towards other community members</li>
        </ul>

        <p>
          <strong>
            Examples of unacceptable behaviors by participants include:
          </strong>
        </p>

        <ul>
          <li>
            Trolling, insulting/derogatory comments, and personal or political
            attacks
          </li>
          <li>
            Providing unconstructive or disruptive feedback on <Org />
          </li>
          <li>Public or private harassment</li>
          <li>
            Publishing others’ private information, such as a physical or
            electronic address, without explicit permission
          </li>
          <li>
            The use of sexualized language or imagery and unwelcome sexual
            attention or advances
          </li>
          <li>
            Other conduct which could reasonably be considered inappropriate in
            a professional setting
          </li>
        </ul>
      </section>

      <section>
        <h2 id="conflict-of-interest-competing-interest">
          Conflict of Interest/Competing interest
        </h2>
        <p>
          What is considered conflict of interest (
          <abbr title="Conflict of Interest">CoI</abbr>) at <Org /> and why
          should you care about them?
        </p>
        <p>
          <abbr title="Conflict of Interest">CoI</abbr> comes in many shapes and
          forms. In general, as defined on{' '}
          <a href="https://en.wikipedia.org/wiki/Conflict_of_interest">
            Wikipedia
          </a>
          , a <abbr title="Conflict of Interest">CoI</abbr> emerges when “a
          person or organization is involved in multiple interests, financial or
          otherwise, and serving one interest could involve working against
          another.”
        </p>
        <p>
          In the context of peer review, PLoS refers to it as competing interest
          and defines it as follows:
        </p>

        <blockquote cite="http://reviewers.plos.org/resources/competing-interests-for-reviewers/">
          <p>
            A competing interest is anything that interferes with, or could
            reasonably be perceived as interfering with, the full and objective
            presentation and <Org /> of a published preprint.
          </p>
          <footer>
            <a href="http://reviewers.plos.org/resources/competing-interests-for-reviewers/">
              PLoS Reviewer Center
            </a>
          </footer>
        </blockquote>

        <p>
          A competing interest can be financial or non-financial, professional,
          or personal. It can arise in relationship to an organization, a
          department, a laboratory, or a person.
        </p>
        <p>
          Competing interests matter because they can introduce perceived or
          actual bias in the evaluation of the preprint that can have
          repercussions all the way to the journal acceptance of that
          manuscript.{' '}
        </p>
        <p>
          To read more about competing interests in peer review, please refer to
          the{' '}
          <a href="http://reviewers.plos.org/resources/competing-interests-for-reviewers/">
            PLoS Reviewer Center’s resources
          </a>
          . They provide a very useful checklist for you to self-evaluate your
          possible competing interest in relation to a manuscript you wish to
          review or comment.{' '}
        </p>
        <p>
          <strong>
            If you find that you have a potential conflict with the authors, or
            the organization to which the author(s) is affiliated, please do
            disclose it in your <Org />. A failure in disclosing a competing
            interest is considered a violation of the <Org /> Code of Conduct
            and will be treated accordingly.
          </strong>
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

function Org() {
  return <span>Rapid PREreview for Outbreak Science</span>;
}
