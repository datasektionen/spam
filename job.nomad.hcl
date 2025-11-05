job "spam-old" {
  type = "service"

  group "spam-old" {
    network {
      port "http" { }
    }

    service {
      name     = "spam-old"
      port     = "http"
      provider = "nomad"
      tags = [
        "traefik.enable=true",
        "traefik.http.routers.spam-old.rule=Host(`spam-old.datasektionen.se`)",
        "traefik.http.routers.spam-old.tls.certresolver=default",
      ]
    }

    task "spam" {
      driver = "docker"

      config {
        image = var.image_tag
        ports = ["http"]
      }

      template {
        data        = <<ENV
{{ with nomadVar "nomad/jobs/spam-old" }}
AWS_ACCESS_KEY_ID={{ .aws_access_id }}
AWS_SECRET_ACCESS_KEY={{ .aws_access_key }}
HIVE_API_KEY={{ .hive_api_key }}
{{ end }}
PORT={{ env "NOMAD_PORT_http" }}
HIVE_API_URL=https://hive.datasektionen.se/api/v1
ENV
        destination = "local/.env"
        env         = true
      }

      resources {
        memory = 120
      }
    }
  }
}

variable "image_tag" {
  type = string
  default = "ghcr.io/datasektionen/spam:latest"
}
