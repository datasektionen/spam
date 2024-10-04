# Spam

A system for sending mail via the datasektionen AWS SES service.

## API

### `POST /api/sendmail`

Send an email to one or more recipients. Requests can be sent using JSON or form data. The following fields are required:

- `key`: A valid API key from [pls](https://pls.datasektionen.se/) with the permission `spam` in the `spam` system.
- `from`: The email address to send the email from. Must be a verified email address.
- `to`: A list of email addresses to send the email to.
- `subject`: The subject of the email.

Either `text` or `html` must be provided:

- `content`: The plain text content of the email. This gets rendered into HTML using a markdown parser. The parser also accepts HTML, so you can use that directly.
- `html`: The HTML content of the email. This will first be converted into markdown, and
  then rendered back into HTML. (sidenote: why do we do this???)

The following field are optional:

- `replyTo`: The email address to set as the reply-to address.
- `cc`: A list of email addresses to send a copy of the email to.
- `bcc`: A list of email addresses to send a blind copy of the email to.
- `template`: The name of a template to use for the email. There are currently three templates available:

  - `default`: A simple template with a header and footer in the
    Datasektionen style.
  - `metaspexet`: A similar template but in the style of metaspexet.
  - `none`: A raw template with no styling. Use this if you want to
    provide your own HTML.

- `attachments[]`: Attachments to include in the email. A maximum of 5 files can be attached.
  This can only be used when using `form-data` content type. The files should be sent as a list of files with the key `attachments[]`.

An example of a valid JSON request:

```json
{
  "key": "your key",
  "template": "default",
  "from": {
    "name": "Ture Teknolog",
    "address": "turetek@datasektionen.se"
  },
  "replyTo": "noreply@datasektionen.se",
  "to": ["recipient@domain.org", "another@one.com"],
  "subject": "Hello, world!",
  "content": "This is the plain text content of the email.",
  "cc": [
    {
      "name": "Herr/Fru Ordförande",
      "address": "ordf@datasektionen.se"
    }
  ],
  "bcc": ["very@secret.com"]
}
```

### `GET /api/ping`

Returns "I'm alive!" if the server is running.

![spam](http://media.boingboing.net/wp-content/uploads/2016/01/Spam-Can.jpg)
