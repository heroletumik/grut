ARGS = $(filter-out $@,$(MAKECMDGOALS))
MAKEFLAGS += --silent

list:
	sh -c "echo; $(MAKE) -p no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'Makefile'| sort"

#############################
# Docker machine states
#############################

start:
	docker-compose start

stop:
	docker-compose stop

state:
	docker-compose ps

build:
	@if [ ! -f ./.env ]; then\
	  	read -p "Enter domain for all services (w/o port and protocol):" domain; echo "DOMAIN=$$domain" >> ./.env; \
	  	read -p "Enter master public key:" master_key; echo "MASTER_KEY=$$master_key" >> ./.env; \
	  	read -p "Enter general agent public key:" g_agent_key; echo "G_AGENT_KEY=$$g_agent_key" >> ./.env; \
	  	read -p "Enter keyserver host (with protocol and port [optional]):" keyserver_host; echo "KEYSERVER_HOST=$$keyserver_host" >> ./.env; \
	  	read -p "Enter horizon host (with protocol and port [optional]):" horizon_host; echo "HORIZON_HOST=$$horizon_host" >> ./.env; \
	  	read -p "Enter emission host (with protocol and port [optional]):" emission_host; echo "EMISSION_HOST=$$emission_host" >> ./.env; \
	  	read -p "Enter info host (with protocol and port [optional]):" info_host; echo "INFO_HOST=$$info_host" >> ./.env; \
	  	read -p "Enter exchange host (with protocol and port [optional]):" exchange_host; echo "EXCHANGE_HOST=$$exchange_host" >> ./.env; \
	  	read -p "Enter merchant host (with protocol and port [optional]):" merchant_host; echo "MERCHANT_HOST=$$merchant_host" >> ./.env; \
	  	read -p "Enter welcome host (with protocol and port [optional]):" welcome_host; echo "WELCOME_HOST=$$welcome_host" >> ./.env; \
	  	read -p "Enter api host (with protocol and port [optional]):" api_host; echo "API_HOST=$$api_host" >> ./.env; \
	  	read -p "Enter smartmoney host (for link to documentation) (with protocol and port [optional]):" sm_host; echo "SMARTMONEY_HOST=$$sm_host" >> ./.env; \
	  	read -p "Enter riak host (domain only):" riak_host; echo "RIAK_HOST=$$riak_host" >> ./.env; \
	  	read -p "Enter stellar network:" stellar_network; echo "STELLAR_NETWORK=$$stellar_network" >> ./.env; \
	fi
	docker-compose build
	docker-compose up -d

dev: build
	@if [ ! -f ./env.js ]; then\
	  	echo "var Env = {" >> ./env.js; \
		./scripts/generate_js_env.sh \
		echo "" >> ./env.js; \
	  	echo "};" >> ./env.js; \
  		echo "module.exports = Env;" >> ./env.js; \
	fi
	docker-compose build
	docker-compose up -d

attach:
	docker exec -i -t ${c} /bin/bash

purge:
	docker-compose down