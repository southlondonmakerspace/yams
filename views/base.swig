<!DOCTYPE html>
<html lang="en">
	<head>
		<title>{% block title %}{% if title %}{{ title }} &mdash; {% endif %} Tool Control{% endblock %}</title>
		<link rel="shortcut icon" href="/imgs/favicon.ico" />
		{% block stylesheets %}
			<link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css">
			<link rel="stylesheet" type="text/css" href="/css/style.css">
		{% endblock %}
		{% block scripts %}
			<script src="/js/jquery.js"></script>
			<script src="/js/bootstrap.js"></script>
			<script src="/js/script.js"></script>
		{% endblock %}
	</head>
	<body>
		<div class="container">
			<a href="/"><img class="logo" src="/imgs/logo.png" /></a>
			{% if loggedIn %}
				<p class="logout">
					<a href="/logout" class="btn btn-default" role="button">Logout</a>
				</p>
			{% endif %}
			{% if heading %}
				<div class="page-header">
					<h2>{{ heading }}</h2>
				</div>
			{% endif %}
			{% block content %}{% endblock %}
		</div>
	</body>
</html>
