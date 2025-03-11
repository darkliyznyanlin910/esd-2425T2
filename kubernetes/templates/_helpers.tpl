{{- define "my-app.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "my-app.labels" -}}
app.kubernetes.io/name: {{ include "my-app.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Common template helpers for working with YAML values
*/}}

{{- define "common.tplvalues.render" -}}
{{- $file := .file }}
{{- $context := .context }}
{{- $content := tpl ($context.Files.Get $file) $context | fromYaml }}
{{- toYaml $content -}}
{{- end -}}

{{- define "loadEnvVars" -}}
{{- $envVars := tpl ($.Files.Get "env.yaml") $ | fromYaml -}}
{{- toYaml $envVars -}}
{{- end -}} 